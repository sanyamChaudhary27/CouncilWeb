import { create } from 'zustand';
import { CouncilSlice, createCouncilSlice } from './slices/CouncilSlice';
import { ProjectSlice, createProjectSlice } from './slices/ProjectSlice';
import { CatalogSlice, createCatalogSlice } from './slices/CatalogSlice';
import { McpSlice, createMcpSlice } from './slices/McpSlice';

export type CouncilState = CouncilSlice & ProjectSlice & CatalogSlice & McpSlice;

export const useCouncilStore = create<CouncilState>()((...a) => ({
  ...createCouncilSlice(...a),
  ...createProjectSlice(...a),
  ...createCatalogSlice(...a),
  ...createMcpSlice(...a),
}));
