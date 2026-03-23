import type { ComponentType } from 'react';
import BubbleLayerMetadata from '../layers/BubbleLayerMetadata';
import type { BubbleLayerDataMap } from '../types/bubbleLayers';
import type { BubbleLayerType } from "./../types/bubble"
import BubbleLayerCorpusSampler from '../layers/BubbleLayerCorpusSampler';
import BubbleLayerLbExtraction from '../layers/BubbleLayerLbExtraction';
import BubbleLayerLbAnalysis from '../layers/BubbleLayerLbAnalysis';

type RegistryEntry<T extends BubbleLayerType> = {
    component: ComponentType<{ data: BubbleLayerDataMap[T] }>;
};

// Will need to add fetchers!

export const bubbleRegistry: {
    [Key in BubbleLayerType]: RegistryEntry<Key>
} = {
    corpusMetadata: {
        component: BubbleLayerMetadata,
    },
    corpusSampler: {
        component: BubbleLayerCorpusSampler,
    },
    lbExtraction: {
        component: BubbleLayerLbExtraction,
    },
    lbAnalysis: {
        component: BubbleLayerLbAnalysis,
    }
}