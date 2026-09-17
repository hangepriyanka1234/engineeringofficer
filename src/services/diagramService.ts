import { VisualDiagram, DiagramCategory } from '../types';

export class DiagramService {
  static async getDiagrams(category?: DiagramCategory): Promise<VisualDiagram[]> {
    try {
      const url = category ? `/api/diagrams?category=${category}` : '/api/diagrams';
      const res = await fetch(url);
      const data = await res.json();
      return data.diagrams || [];
    } catch (e) {
      console.error('[DiagramService] Error:', e);
      return [];
    }
  }

  static async getDiagram(id: string): Promise<VisualDiagram | null> {
    try {
      const res = await fetch(`/api/diagrams/${id}`);
      const data = await res.json();
      return data.diagram || null;
    } catch (e) {
      return null;
    }
  }
}
