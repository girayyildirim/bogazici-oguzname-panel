import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'text',
      name: 'Simple text option',
      description: 'Description of panel option',
      defaultValue: 'Default value of text input option',
    })

    // ✅ BONUS: Toggle developer name visibility
    .addBooleanSwitch({
      path: 'showName',
      name: 'Show developer name',
      description: 'Show/hide developer name inside the panel UI',
      defaultValue: true,
    })

    // ✅ BONUS: Background color option
    .addTextInput({
      path: 'bgColor',
      name: 'Background color',
      description: 'Panel background color (CSS value like #1f1f1f, #000000, darkred, rgb(...))',
      defaultValue: '#1f1f1f',
    })

    // ✅ BONUS: Display mode (layout/mode option)
    .addRadio({
      path: 'displayMode',
      name: 'Display mode',
      defaultValue: 'center',
      settings: {
        options: [
          { value: 'center', label: 'Centered' },
          { value: 'compact', label: 'Compact' },
        ],
      },
    })

    // ✅ BONUS: AI Insight options (WOW)
    .addBooleanSwitch({
      path: 'showAiInsight',
      name: 'Show AI Insight',
      description: 'Enable AI-like insights generated from Grafana query data',
      defaultValue: true,
    })
    .addRadio({
      path: 'aiInsightMode',
      name: 'AI Insight mode',
      defaultValue: 'balanced',
      settings: {
        options: [
          { value: 'safe', label: 'Safe' },
          { value: 'balanced', label: 'Balanced' },
          { value: 'aggressive', label: 'Aggressive' },
        ],
      },
      showIf: (cfg) => (cfg as any).showAiInsight,
    })
    .addTextInput({
      path: 'aiSensitivity',
      name: 'AI Sensitivity (0-100)',
      description: 'Higher sensitivity flags anomalies more easily (0-100)',
      defaultValue: '60',
      showIf: (cfg) => (cfg as any).showAiInsight,
    })

    // ✅ EXTRA BONUS B: Data Quality badge
    .addBooleanSwitch({
      path: 'showDataQuality',
      name: 'Show data quality indicator',
      description: 'Display a data quality badge based on datapoints & volatility',
      defaultValue: true,
      showIf: (cfg) => (cfg as any).showAiInsight,
    })

    // ✅ EXTRA BONUS A: AI Explainability (transparency)
    .addBooleanSwitch({
      path: 'showAiExplanation',
      name: 'Show AI explanation',
      description: 'Explain how AI insights are generated (trend/volatility/spikes)',
      defaultValue: false,
      showIf: (cfg) => (cfg as any).showAiInsight,
    })

    // (Mevcut option'ların)
    .addBooleanSwitch({
      path: 'showSeriesCount',
      name: 'Show series counter',
      defaultValue: false,
    })
    .addRadio({
      path: 'seriesCountSize',
      defaultValue: 'sm',
      name: 'Series counter size',
      settings: {
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
        ],
      },
      showIf: (config) => (config as any).showSeriesCount,
    });
});
