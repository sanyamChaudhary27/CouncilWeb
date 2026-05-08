import OpenAI from 'openai';

const apiKey = process.env.NVIDIA_NIM_KEY;

export const nimClient = new OpenAI({
  apiKey: apiKey || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});
