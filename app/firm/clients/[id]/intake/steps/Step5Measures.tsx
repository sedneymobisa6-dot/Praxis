import type { Measure } from '../form';

type Props = {
  measures: Measure[];
  setMeasures: (m: Measure[]) => void;
};

export default function Step5Measures(props: Props) {
  const measures = props.measures;

  function updateMeasure(index: number, field: string, value: string) {
    const updated = [...measures];
    (updated[index] as any)[field] = value;
    props.setMeasures(updated);
  }

  function addMeasure() {
    const updated = [...measures];
    updated.push({ risk_description: '', safeguard_description: '' });
    props.setMeasures(updated);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-zinc-900">Security measures</h2>
      {measures.map((measure, index) => (
        <div key={index} className="rounded-lg border border-zinc-200 p-4 space-y-3">
          <input
            type="text"
            value={measure.risk_description}
            onChange={(e) => updateMeasure(index, 'risk_description', e.target.value)}
            placeholder="Risk"
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            value={measure.safeguard_description}
            onChange={(e) => updateMeasure(index, 'safeguard_description', e.target.value)}
            placeholder="Safeguard"
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addMeasure}
        className="text-sm font-medium"
        style={{ color: '#0A3D62' }}
      >
        + Add another
      </button>
    </div>
  );
}