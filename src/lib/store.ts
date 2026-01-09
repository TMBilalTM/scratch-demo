import { create } from "zustand";

interface Sprite {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  size: number;
  visible: boolean;
  costume: string;
  costumeSvg?: string;
  message?: string;
  color?: string;
}

interface EditorStore {
  sprites: Sprite[];
  initialSprites: Sprite[]; // Başlangıç durumu
  selectedSpriteId: string | null;
  isPlaying: boolean;
  zoom: number;
  gridEnabled: boolean;
  backdrop: string;
  
  addSprite: (sprite: Sprite) => void;
  updateSprite: (id: string, updates: Partial<Sprite>) => void;
  deleteSprite: (id: string) => void;
  selectSprite: (id: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  setBackdrop: (backdrop: string) => void;
  resetStage: () => void;
  resetToInitialState: () => void;
  saveInitialState: () => void;
  setSprites: (sprites: Sprite[]) => void;
  loadProjectState: (state: { sprites: Sprite[]; backdrop: string; zoom?: number; gridEnabled?: boolean }) => void;
}

const defaultSprite: Sprite = {
  id: "sprite-1",
  name: "Cat",
  x: 240,
  y: 180,
  rotation: 0,
  size: 80,
  visible: true,
  costume: "cat",
  color: "#FF6B6B",
};

export const useEditorStore = create<EditorStore>((set) => ({
  sprites: [defaultSprite],
  initialSprites: [defaultSprite], // Başlangıç durumunu da sakla
  selectedSpriteId: "sprite-1",
  isPlaying: false,
  zoom: 1,
  gridEnabled: true,
  backdrop: "sky",
  
  addSprite: (sprite) =>
    set((state) => {
      const newSprites = [...state.sprites, sprite];
      return {
        sprites: newSprites,
        initialSprites: JSON.parse(JSON.stringify(newSprites)), // Başlangıç durumunu da güncelle
        selectedSpriteId: sprite.id,
      };
    }),
    
  updateSprite: (id, updates) =>
    set((state) => ({
      sprites: state.sprites.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
    
  deleteSprite: (id) =>
    set((state) => {
      const newSprites = state.sprites.filter((s) => s.id !== id);
      return {
        sprites: newSprites,
        initialSprites: JSON.parse(JSON.stringify(newSprites)), // Başlangıç durumunu da güncelle
        selectedSpriteId:
          state.selectedSpriteId === id ? null : state.selectedSpriteId,
      };
    }),
    
  selectSprite: (id) => set({ selectedSpriteId: id }),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(3, zoom)) }),
  
  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),
  
  setBackdrop: (backdrop) => set({ backdrop }),
  
  resetStage: () =>
    set((state) => ({
      sprites: state.sprites.map((s) => ({
        ...s,
        x: 240,
        y: 180,
        rotation: 0,
        size: 80,
        message: undefined,
      })),
      isPlaying: false,
    })),
  
  // Runtime çalıştırıldığında başlangıç durumuna dön
  resetToInitialState: () =>
    set((state) => ({
      sprites: JSON.parse(JSON.stringify(state.initialSprites)), // Deep copy
      isPlaying: false,
    })),
  
  // Mevcut durumu başlangıç durumu olarak kaydet
  saveInitialState: () =>
    set((state) => ({
      initialSprites: JSON.parse(JSON.stringify(state.sprites)), // Deep copy
    })),
    
  setSprites: (sprites) => set({ sprites }),
  
  loadProjectState: (state) => 
    set(() => ({
      sprites: state.sprites,
      initialSprites: JSON.parse(JSON.stringify(state.sprites)), // Başlangıç durumunu da kaydet
      backdrop: state.backdrop,
      zoom: state.zoom ?? 1,
      gridEnabled: state.gridEnabled ?? true,
    })),
}));
