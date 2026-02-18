import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete']);

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function getNodeText(node, sourceFile) {
  return sourceFile.text.slice(node.pos, node.end);
}

function getPropertyName(nameNode) {
  if (ts.isIdentifier(nameNode)) return nameNode.text;
  if (ts.isStringLiteral(nameNode)) return nameNode.text;
  if (ts.isNumericLiteral(nameNode)) return nameNode.text;
  return '';
}

function createModuleCache() {
  return new Map();
}

async function loadModule(filePath, cache) {
  const normalized = path.resolve(filePath);
  if (cache.has(normalized)) return cache.get(normalized);

  const content = await fs.readFile(normalized, 'utf8');
  const sourceFile = ts.createSourceFile(normalized, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const imports = new Map();
  const exportedConsts = new Map();
  const exportedEnums = new Map();
  const localConsts = new Map();

  for (const stmt of sourceFile.statements) {
    if (ts.isImportDeclaration(stmt) && stmt.importClause && ts.isStringLiteral(stmt.moduleSpecifier)) {
      const modulePath = stmt.moduleSpecifier.text;
      if (stmt.importClause.name) {
        imports.set(stmt.importClause.name.text, { importName: 'default', modulePath });
      }
      const namedBindings = stmt.importClause.namedBindings;
      if (namedBindings && ts.isNamedImports(namedBindings)) {
        for (const element of namedBindings.elements) {
          const localName = element.name.text;
          const importName = element.propertyName ? element.propertyName.text : element.name.text;
          imports.set(localName, { importName, modulePath });
        }
      }
      continue;
    }

    if (ts.isVariableStatement(stmt)) {
      const isExported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
      for (const declaration of stmt.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          localConsts.set(declaration.name.text, declaration.initializer);
          if (isExported) {
            exportedConsts.set(declaration.name.text, declaration.initializer);
          }
        }
      }
      continue;
    }

    if (ts.isEnumDeclaration(stmt)) {
      const isExported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
      if (isExported) {
        exportedEnums.set(stmt.name.text, stmt);
      }
    }
  }

  const module = { filePath: normalized, sourceFile, imports, exportedConsts, exportedEnums, localConsts };
  cache.set(normalized, module);
  return module;
}

function resolveImportPath(fromFile, importPath, sourceRoot) {
  if (importPath.startsWith('@/')) {
    return path.resolve(sourceRoot, importPath.slice(2).replace(/\.js$/, '.ts'));
  }
  if (importPath.startsWith('.')) {
    return path.resolve(path.dirname(fromFile), importPath.replace(/\.js$/, '.ts'));
  }
  return null;
}

function parseEnumDeclaration(enumDeclaration) {
  const values = [];
  for (const member of enumDeclaration.members) {
    const key = getPropertyName(member.name);
    if (!key) continue;
    if (member.initializer && ts.isStringLiteral(member.initializer)) {
      values.push(member.initializer.text);
    } else {
      values.push(key);
    }
  }
  return { kind: 'enum', values };
}

function isTypeCall(expr, name) {
  return (
    ts.isCallExpression(expr) &&
    ts.isPropertyAccessExpression(expr.expression) &&
    ts.isIdentifier(expr.expression.expression) &&
    expr.expression.expression.text === 'Type' &&
    expr.expression.name.text === name
  );
}

function parseSchemaExpression(expr, ctx) {
  if (isTypeCall(expr, 'Optional')) {
    return { kind: 'optional', inner: parseSchemaExpression(expr.arguments[0], ctx) };
  }
  if (isTypeCall(expr, 'String')) return { kind: 'primitive', name: 'string' };
  if (isTypeCall(expr, 'Integer')) return { kind: 'primitive', name: 'integer' };
  if (isTypeCall(expr, 'Number')) return { kind: 'primitive', name: 'number' };
  if (isTypeCall(expr, 'Boolean')) return { kind: 'primitive', name: 'boolean' };
  if (isTypeCall(expr, 'Null')) return { kind: 'null' };
  if (isTypeCall(expr, 'Array')) {
    return { kind: 'array', item: parseSchemaExpression(expr.arguments[0], ctx) };
  }
  if (isTypeCall(expr, 'Literal')) {
    const arg = expr.arguments[0];
    if (ts.isStringLiteral(arg)) return { kind: 'literal', value: arg.text };
    if (ts.isNumericLiteral(arg)) return { kind: 'literal', value: Number(arg.text) };
    return { kind: 'literal', value: getNodeText(arg, ctx.module.sourceFile).trim() };
  }
  if (isTypeCall(expr, 'Union')) {
    const arg = expr.arguments[0];
    if (!ts.isArrayLiteralExpression(arg)) return { kind: 'unknown' };
    return { kind: 'union', variants: arg.elements.map((el) => parseSchemaExpression(el, ctx)) };
  }
  if (isTypeCall(expr, 'Enum')) {
    const arg = expr.arguments[0];
    if (ts.isIdentifier(arg)) {
      registerImportedOrLocalType(arg.text, ctx);
      return { kind: 'ref', name: arg.text };
    }
    return { kind: 'unknown' };
  }
  if (isTypeCall(expr, 'Object')) {
    const arg = expr.arguments[0];
    if (!ts.isObjectLiteralExpression(arg)) return { kind: 'object', fields: [] };
    const fields = [];
    for (const prop of arg.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const fieldName = getPropertyName(prop.name);
      if (!fieldName) continue;
      const parsed = parseSchemaExpression(prop.initializer, ctx);
      if (parsed.kind === 'optional') {
        fields.push({ name: fieldName, schema: parsed.inner, optional: true });
      } else {
        fields.push({ name: fieldName, schema: parsed, optional: false });
      }
    }
    return { kind: 'object', fields };
  }

  if (ts.isIdentifier(expr)) {
    registerImportedOrLocalType(expr.text, ctx);
    return { kind: 'ref', name: expr.text };
  }

  return { kind: 'unknown' };
}

function parseObjectKeys(expr, module) {
  if (ts.isIdentifier(expr)) {
    const local = module.localConsts.get(expr.text);
    if (local) return parseObjectKeys(local, module);
    return [];
  }

  if (isTypeCall(expr, 'Object')) {
    const arg = expr.arguments[0];
    if (!ts.isObjectLiteralExpression(arg)) return [];
    const keys = [];
    for (const prop of arg.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const fieldName = getPropertyName(prop.name);
        if (fieldName) keys.push(fieldName);
      }
    }
    return keys;
  }

  return [];
}

function resolveObjectLiteral(expr, module) {
  if (ts.isObjectLiteralExpression(expr)) return expr;
  if (ts.isIdentifier(expr)) {
    const local = module.localConsts.get(expr.text);
    if (local && ts.isObjectLiteralExpression(local)) return local;
  }
  return null;
}

function registerSchemaDefinition(name, schema, ctx) {
  if (!ctx.typeDefinitions.has(name)) {
    ctx.typeDefinitions.set(name, { kind: 'schema', schema });
  }
}

function registerEnumDefinition(name, enumDecl, ctx) {
  if (!ctx.typeDefinitions.has(name)) {
    ctx.typeDefinitions.set(name, parseEnumDeclaration(enumDecl));
  }
}

function registerImportedOrLocalType(identifierName, ctx) {
  if (ctx.typeDefinitions.has(identifierName)) return;

  const localEnum = ctx.module.exportedEnums.get(identifierName);
  if (localEnum) {
    registerEnumDefinition(identifierName, localEnum, ctx);
    return;
  }

  const local = ctx.module.localConsts.get(identifierName);
  if (local) {
    const schema = parseSchemaExpression(local, ctx);
    registerSchemaDefinition(identifierName, schema, ctx);
    return;
  }

  const imported = ctx.module.imports.get(identifierName);
  if (!imported) return;

  const resolvedImportPath = resolveImportPath(ctx.module.filePath, imported.modulePath, ctx.sourceRoot);
  if (!resolvedImportPath) return;

  ctx.pending.push({ filePath: resolvedImportPath, exportName: imported.importName, localName: identifierName });
}

async function flushPendingTypes(ctx, moduleCache) {
  while (ctx.pending.length > 0) {
    const next = ctx.pending.pop();
    if (!next) continue;
    if (ctx.typeDefinitions.has(next.localName)) continue;

    const importedModule = await loadModule(next.filePath, moduleCache);
    const exportedConst = importedModule.exportedConsts.get(next.exportName);
    if (exportedConst) {
      const importedCtx = {
        ...ctx,
        module: importedModule,
      };
      const schema = parseSchemaExpression(exportedConst, importedCtx);
      ctx.typeDefinitions.set(next.localName, { kind: 'schema', schema });
      continue;
    }

    const exportedEnum = importedModule.exportedEnums.get(next.exportName);
    if (exportedEnum) {
      registerEnumDefinition(next.localName, exportedEnum, ctx);
    }
  }
}

async function collectUsecases(sourceRoot, moduleCache) {
  const usecaseFiles = (await walk(path.join(sourceRoot, 'features'))).filter((filePath) =>
    /\/usecases\/[^/]+\.ts$/.test(toPosixPath(filePath))
  );

  const usecases = new Map();
  const typeDefinitions = new Map();

  for (const usecaseFile of usecaseFiles) {
    const module = await loadModule(usecaseFile, moduleCache);
    const fileName = path.basename(usecaseFile, '.ts');
    const inputName = `${fileName}Input`;
    const outputName = `${fileName}Output`;
    const inputSchemaConst = `${fileName}InputSchema`;
    const outputSchemaConst = `${fileName}OutputSchema`;

    const inputExpr = module.exportedConsts.get(inputSchemaConst);
    const outputExpr = module.exportedConsts.get(outputSchemaConst);
    if (!inputExpr || !outputExpr) continue;

    const ctx = {
      sourceRoot,
      module,
      typeDefinitions,
      pending: [],
    };

    const inputSchema = parseSchemaExpression(inputExpr, ctx);
    registerSchemaDefinition(inputName, inputSchema, ctx);
    const outputSchema = parseSchemaExpression(outputExpr, ctx);
    registerSchemaDefinition(outputName, outputSchema, ctx);
    await flushPendingTypes(ctx, moduleCache);

    usecases.set(fileName, {
      name: fileName,
      inputTypeName: inputName,
      outputTypeName: outputName,
      filePath: usecaseFile,
    });
  }

  return { usecases, typeDefinitions };
}

function evalPrefixExpression(expr, apiPrefix) {
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text;
  if (ts.isTemplateExpression(expr)) {
    let value = expr.head.text;
    for (const span of expr.templateSpans) {
      if (ts.isIdentifier(span.expression) && span.expression.text === 'API_PREFIX') {
        value += apiPrefix;
      }
      value += span.literal.text;
    }
    return value;
  }
  return '';
}

async function collectRoutePrefixes(sourceRoot, moduleCache) {
  const appRoutesFile = path.join(sourceRoot, 'app', 'routes', 'index.ts');
  const module = await loadModule(appRoutesFile, moduleCache);

  const constantsFile = path.join(sourceRoot, 'app', 'config', 'constants.ts');
  const constantsModule = await loadModule(constantsFile, moduleCache);
  const apiPrefixExpr = constantsModule.exportedConsts.get('API_PREFIX');
  let apiPrefix = '/api/v1';
  if (apiPrefixExpr && (ts.isStringLiteral(apiPrefixExpr) || ts.isNoSubstitutionTemplateLiteral(apiPrefixExpr))) {
    apiPrefix = apiPrefixExpr.text;
  }

  const importMap = new Map();
  for (const [localName, imported] of module.imports.entries()) {
    const routePath = resolveImportPath(module.filePath, imported.modulePath, sourceRoot);
    if (routePath) importMap.set(localName, routePath);
  }

  const prefixes = new Map();
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      if (
        node.expression.name.text === 'register' &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'fastify' &&
        node.arguments.length >= 2 &&
        ts.isIdentifier(node.arguments[0]) &&
        ts.isObjectLiteralExpression(node.arguments[1])
      ) {
        const routeIdentifier = node.arguments[0].text;
        const routeFilePath = importMap.get(routeIdentifier);
        if (routeFilePath) {
          const optionsArg = node.arguments[1];
          const prefixProp = optionsArg.properties.find(
            (prop) => ts.isPropertyAssignment(prop) && getPropertyName(prop.name) === 'prefix'
          );
          if (prefixProp && ts.isPropertyAssignment(prefixProp)) {
            const prefix = evalPrefixExpression(prefixProp.initializer, apiPrefix);
            prefixes.set(path.resolve(routeFilePath), prefix);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(module.sourceFile);

  return prefixes;
}

async function collectEndpoints(sourceRoot, usecases, typeDefinitions, moduleCache) {
  const prefixes = await collectRoutePrefixes(sourceRoot, moduleCache);
  const routeFiles = (await walk(path.join(sourceRoot, 'features'))).filter((filePath) =>
    /\/routes\/[^/]+\.ts$/.test(toPosixPath(filePath))
  );

  const endpoints = [];

  for (const routeFile of routeFiles) {
    const module = await loadModule(routeFile, moduleCache);
    const prefix = prefixes.get(path.resolve(routeFile)) ?? '';
    const featureMatch = toPosixPath(routeFile).match(/\/features\/([^/]+)\//);
    const feature = featureMatch ? featureMatch[1] : 'common';

    function visit(node) {
      if (!(ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression))) {
        ts.forEachChild(node, visit);
        return;
      }
      if (!ts.isIdentifier(node.expression.expression) || node.expression.expression.text !== 'fastify') {
        ts.forEachChild(node, visit);
        return;
      }

      const method = node.expression.name.text.toLowerCase();
      if (!HTTP_METHODS.has(method) || node.arguments.length < 2) {
        ts.forEachChild(node, visit);
        return;
      }

      const pathArg = node.arguments[0];
      const optionsArg = node.arguments[1];
      if (!ts.isStringLiteral(pathArg) || !ts.isObjectLiteralExpression(optionsArg)) {
        ts.forEachChild(node, visit);
        return;
      }
      const routePath = pathArg.text;
      const schemaProp = optionsArg.properties.find(
        (prop) => ts.isPropertyAssignment(prop) && getPropertyName(prop.name) === 'schema'
      );
      if (!schemaProp || !ts.isPropertyAssignment(schemaProp)) {
        ts.forEachChild(node, visit);
        return;
      }

      const schemaObject = resolveObjectLiteral(schemaProp.initializer, module);
      if (!schemaObject) {
        ts.forEachChild(node, visit);
        return;
      }
      const queryProp = schemaObject.properties.find(
        (prop) => ts.isPropertyAssignment(prop) && getPropertyName(prop.name) === 'querystring'
      );
      const paramsProp = schemaObject.properties.find(
        (prop) => ts.isPropertyAssignment(prop) && getPropertyName(prop.name) === 'params'
      );
      const bodyProp = schemaObject.properties.find(
        (prop) => ts.isPropertyAssignment(prop) && getPropertyName(prop.name) === 'body'
      );
      const responseProp = schemaObject.properties.find(
        (prop) => ts.isPropertyAssignment(prop) && getPropertyName(prop.name) === 'response'
      );

      let usecaseName = '';
      if (queryProp && ts.isPropertyAssignment(queryProp) && ts.isIdentifier(queryProp.initializer)) {
        const name = queryProp.initializer.text;
        if (name.endsWith('InputSchema')) usecaseName = name.slice(0, -'InputSchema'.length);
      }
      if (!usecaseName && bodyProp && ts.isPropertyAssignment(bodyProp) && ts.isIdentifier(bodyProp.initializer)) {
        const name = bodyProp.initializer.text;
        if (name.endsWith('InputSchema')) usecaseName = name.slice(0, -'InputSchema'.length);
      }
      if (
        !usecaseName &&
        responseProp &&
        ts.isPropertyAssignment(responseProp) &&
        ts.isObjectLiteralExpression(responseProp.initializer)
      ) {
        const response200 = responseProp.initializer.properties.find(
          (prop) => ts.isPropertyAssignment(prop) && getPropertyName(prop.name) === '200'
        );
        if (response200 && ts.isPropertyAssignment(response200) && ts.isIdentifier(response200.initializer)) {
          const name = response200.initializer.text;
          if (name.endsWith('OutputSchema')) usecaseName = name.slice(0, -'OutputSchema'.length);
        }
      }
      if (!usecaseName || !usecases.has(usecaseName)) {
        ts.forEachChild(node, visit);
        return;
      }

      const usecase = usecases.get(usecaseName);
      const pathParams = [];
      const pathParamMatcher = routePath.matchAll(/:([A-Za-z0-9_]+)/g);
      for (const match of pathParamMatcher) {
        if (match[1]) pathParams.push(match[1]);
      }

      const inputTypeDef = typeDefinitions.get(usecase.inputTypeName);
      const inputFields =
        inputTypeDef && inputTypeDef.kind === 'schema' && inputTypeDef.schema.kind === 'object'
          ? inputTypeDef.schema.fields
          : [];
      const queryParams = inputFields
        .filter((field) => !pathParams.includes(field.name))
        .map((field) => ({ name: field.name, optional: field.optional }));
      const bodyFields = bodyProp && ts.isPropertyAssignment(bodyProp) ? parseObjectKeys(bodyProp.initializer, module) : [];

      endpoints.push({
        feature,
        method,
        fullPath: `${prefix}${routePath}`,
        usecaseName,
        inputTypeName: usecase.inputTypeName,
        outputTypeName: usecase.outputTypeName,
        pathParams,
        queryParams,
        hasBody: bodyFields.length > 0,
      });

      ts.forEachChild(node, visit);
    }

    visit(module.sourceFile);
  }

  return endpoints;
}

export async function collectSourceSpec(sourceRoot) {
  const moduleCache = createModuleCache();
  const { usecases, typeDefinitions } = await collectUsecases(sourceRoot, moduleCache);
  const endpoints = await collectEndpoints(sourceRoot, usecases, typeDefinitions, moduleCache);
  return { endpoints, typeDefinitions };
}
