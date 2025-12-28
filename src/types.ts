export type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  text: string;

  // ✅ Core bonus options
  showName?: boolean;
  bgColor?: string;
  displayMode?: 'center' | 'compact';

  // ✅ Series counter options
  showSeriesCount?: boolean;
  seriesCountSize?: SeriesSize;

  // ✅ AI Bonus options
  showAiInsight?: boolean;
  aiInsightMode?: 'safe' | 'balanced' | 'aggressive';

  /**
   * aiSensitivity comes from a TextInput in module.ts,
   * so it can arrive as string or number.
   */
  aiSensitivity?: number | string;

  // ✅ EXTRA BONUS A: Explainability
  showAiExplanation?: boolean;

  // ✅ EXTRA BONUS B: Data Quality indicator
  showDataQuality?: boolean;
}
