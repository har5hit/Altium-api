import { sanitizeSwiftIdentifier, toCamelCase, toPascalCase } from './naming.mjs';

function swiftType(schema, definitions) {
  if (!schema) return 'JSONValue';

  if (schema.kind === 'optional') {
    return `${swiftType(schema.inner, definitions)}?`;
  }
  if (schema.kind === 'primitive') {
    if (schema.name === 'string') return 'String';
    if (schema.name === 'integer') return 'Int';
    if (schema.name === 'number') return 'Double';
    if (schema.name === 'boolean') return 'Bool';
    return 'JSONValue';
  }
  if (schema.kind === 'null') return 'JSONValue';
  if (schema.kind === 'array') return `[${swiftType(schema.item, definitions)}]`;
  if (schema.kind === 'literal') {
    if (typeof schema.value === 'string') return 'String';
    if (typeof schema.value === 'number') return 'Double';
    return 'JSONValue';
  }
  if (schema.kind === 'union') {
    const nonNull = schema.variants.filter((variant) => variant.kind !== 'null');
    const hasNull = nonNull.length !== schema.variants.length;
    if (nonNull.length === 1) {
      const base = swiftType(nonNull[0], definitions);
      return hasNull ? `${base}?` : base;
    }
    return 'JSONValue';
  }
  if (schema.kind === 'object') return 'JSONValue';
  if (schema.kind === 'ref') {
    const name = sanitizeSwiftIdentifier(schema.name, 'Model');
    return name;
  }
  return 'JSONValue';
}

function renderStruct(name, schema, definitions) {
  const typeName = sanitizeSwiftIdentifier(name, 'Model');
  const fields = schema.fields ?? [];
  const lines = fields.map((field) => {
    const propertyName = sanitizeSwiftIdentifier(toCamelCase(field.name), 'value');
    const baseType = swiftType(field.schema, definitions);
    const type = field.optional && !baseType.endsWith('?') ? `${baseType}?` : baseType;
    return `    let ${propertyName}: ${type}`;
  });
  return `struct ${typeName}: Codable {\n${lines.join('\n')}\n}\n`;
}

function renderEnum(name, enumDef) {
  const typeName = sanitizeSwiftIdentifier(name, 'EnumValue');
  const values = enumDef.values ?? [];
  const cases = values
    .map((value) => {
      const caseName = sanitizeSwiftIdentifier(toCamelCase(value), 'value');
      return `    case ${caseName} = "${value}"`;
    })
    .join('\n');
  return `enum ${typeName}: String, Codable {\n${cases}\n}\n`;
}

function renderAlias(name, schema, definitions) {
  const typeName = sanitizeSwiftIdentifier(name, 'AliasValue');
  return `typealias ${typeName} = ${swiftType(schema, definitions)}\n`;
}

function renderDefinitionByName(name, definitions) {
  const def = definitions.get(name);
  if (!def) return '';
  const safeName = sanitizeSwiftIdentifier(name, 'Model');

  if (def.kind === 'enum') {
    return renderEnum(safeName, def);
  }
  if (def.kind === 'schema' && def.schema.kind === 'object') {
    return renderStruct(safeName, def.schema, definitions);
  }
  if (def.kind === 'schema') {
    return renderAlias(safeName, def.schema, definitions);
  }
  return '';
}

function buildModels(definitions, excludedTypeNames) {
  const files = [];
  for (const [name, def] of definitions.entries()) {
    if (excludedTypeNames.has(name)) continue;
    const safeName = sanitizeSwiftIdentifier(name, 'Model');
    let content = '';

    if (def.kind === 'enum') {
      content = renderEnum(safeName, def);
    } else if (def.kind === 'schema' && def.schema.kind === 'object') {
      content = renderStruct(safeName, def.schema, definitions);
    } else if (def.kind === 'schema') {
      content = renderAlias(safeName, def.schema, definitions);
    } else {
      continue;
    }

    files.push({
      name: `Models/${safeName}.swift`,
      content: `import Foundation\n\n${content}`,
    });
  }

  files.sort((a, b) => a.name.localeCompare(b.name));
  return files;
}

function renderPath(pathTemplate, pathParams) {
  let path = pathTemplate;
  for (const param of pathParams) {
    path = path.replace(`:${param}`, `\\(input.${sanitizeSwiftIdentifier(toCamelCase(param), 'value')})`);
  }
  return path;
}

function buildEndpointMethod(endpoint) {
  if (endpoint.method !== 'get') {
    return '';
  }

  const functionName = sanitizeSwiftIdentifier(endpoint.usecaseName, endpoint.usecaseName);
  const inputType = sanitizeSwiftIdentifier(endpoint.inputTypeName, `${endpoint.usecaseName}Input`);
  const outputType = sanitizeSwiftIdentifier(endpoint.outputTypeName, `${endpoint.usecaseName}Output`);
  const renderedPath = renderPath(endpoint.fullPath, endpoint.pathParams);

  const queryLines = [];
  queryLines.push('        var queryParams: [String: String] = [:]');
  for (const queryParam of endpoint.queryParams) {
    const fieldName = sanitizeSwiftIdentifier(toCamelCase(queryParam.name), 'value');
    if (queryParam.optional) {
      queryLines.push(`        if let value = input.${fieldName} {`);
      queryLines.push(`            queryParams["${queryParam.name}"] = String(describing: value)`);
      queryLines.push('        }');
    } else {
      queryLines.push(`        queryParams["${queryParam.name}"] = String(describing: input.${fieldName})`);
    }
  }

  return `    func ${functionName}(_ input: ${inputType}) async throws -> ${outputType} {
${queryLines.join('\n')}
        return try await httpClient.get(
            url: "\\(baseUrl)${renderedPath}",
            queryParams: queryParams
        )
    }`;
}

function buildApis(endpoints, definitions) {
  const byFeature = new Map();
  for (const endpoint of endpoints) {
    if (!byFeature.has(endpoint.feature)) byFeature.set(endpoint.feature, []);
    byFeature.get(endpoint.feature).push(endpoint);
  }

  const files = [];
  for (const [feature, featureEndpoints] of byFeature.entries()) {
    const className = `${sanitizeSwiftIdentifier(toPascalCase(feature), 'Feature')}Api`;
    const methods = featureEndpoints
      .map((endpoint) => buildEndpointMethod(endpoint))
      .filter(Boolean)
      .join('\n\n');

    if (!methods) continue;

    const usecaseTypeNames = [];
    for (const endpoint of featureEndpoints) {
      usecaseTypeNames.push(endpoint.inputTypeName, endpoint.outputTypeName);
    }
    const uniqueUsecaseTypeNames = [...new Set(usecaseTypeNames)];
    const usecaseDefinitions = uniqueUsecaseTypeNames
      .map((typeName) => renderDefinitionByName(typeName, definitions))
      .filter(Boolean)
      .join('\n');

    files.push({
      name: `Apis/${className}.swift`,
      content: `import Foundation

${usecaseDefinitions}

final class ${className} {
    private let httpClient: IHttpApiClient
    private let baseUrl: String

    init(httpClient: IHttpApiClient, baseUrl: String) {
        self.httpClient = httpClient
        self.baseUrl = baseUrl
    }

${methods}
}
`,
    });
  }

  files.sort((a, b) => a.name.localeCompare(b.name));
  return files;
}

export function generateSwiftSdk(sourceSpec) {
  const usecaseTypeNames = new Set();
  for (const endpoint of sourceSpec.endpoints) {
    usecaseTypeNames.add(endpoint.inputTypeName);
    usecaseTypeNames.add(endpoint.outputTypeName);
  }

  const modelFiles = buildModels(sourceSpec.typeDefinitions, usecaseTypeNames);
  const apiFiles = buildApis(sourceSpec.endpoints, sourceSpec.typeDefinitions);

  return [
    {
      name: 'Client/IHttpApiClient.swift',
      content: `import Foundation

protocol IHttpApiClient {
    func get<T: Decodable>(
        url: String,
        queryParams: [String: String],
        headers: [String: String]
    ) async throws -> T
}
`,
    },
    ...modelFiles,
    ...apiFiles,
    {
      name: 'README.md',
      content: `# Generated Swift SDK

- \`Models/\`: generated Swift models (Input/Output and shared models)
- \`Apis/\`: generated API wrappers grouped by feature
 
Usecase-specific \`Input\` and \`Output\` models are declared at the top of each API file.

Function names are usecase names, and model names match backend model/usecase type names.
`,
    },
  ];
}
