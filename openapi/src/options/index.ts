import fs from "fs";
import { load } from "js-yaml";
import swaggerJSDoc from "swagger-jsdoc";
import * as path from "path";
import { JsonObject } from "swagger-ui-express";

export const getSwaggerUi = (routesPath: string): swaggerJSDoc.Options => {
  const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Express API with Swagger",
        version: "1.0.0",
        description: "A simple Express API with Swagger documentation",
      },
    },
    apis: [routesPath],
  };
  return swaggerOptions;
};

export const swaggerSpec = swaggerJSDoc(getSwaggerUi("src/routes/*.ts"));
const yamlFilePath = path.join(__dirname, "./swagger.yaml");
export const yamlFile = fs.readFileSync(yamlFilePath, "utf8");
export const swaggerYaml = load(yamlFile) as JsonObject;
const swaggerJson = JSON.stringify(swaggerYaml, null, 2);

const jsonFilePath = "./openapi.json";
fs.writeFileSync(jsonFilePath, swaggerJson, "utf8");
