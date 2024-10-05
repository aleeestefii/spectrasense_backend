
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  API_LANDSAT: string;
}

const envsSchema = joi
  .object({
     API_LANDSAT: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  apiLandsat: envVars.API_LANDSAT,
};
