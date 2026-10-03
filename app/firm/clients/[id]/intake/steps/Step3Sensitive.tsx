const OPTIONS = [
  'Racial or ethnic origin',
  'Political opinion or adherence',
  'Religious or philosophical beliefs',
  'Marital status and family details',
  'Physical or mental health or condition',
  'Sexual orientation, practices or preferences',
  'Biometric data',
];

type Props = {
  sensitiveApplicable: boolean;
  setSensitiveApplicable: (v: boolean) => void;
  sensitiveTypes: string[];
  setSensitiveTypes: (v: string[]) => void;
  sensitivePurpose: string;
  setSensitivePurpose: (v: string) => void;
};

export default function Step3Sensitive(props: Props) {
  const isApplicable = props.sensitiveApplicable;
  const types = props.sensitiveTypes;

  function toggle(type: string) {
    if (types.includes(type)) {
      props.setSensitiveTypes(types.filter((t) => t !== type));
    } else {
      const updated = [...types];
      updated.push(type);
      props.setSensitiveTypes(updated);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-zinc-900">
        Sensitive personal data
      </h2>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => props.setSensitiveApplicable(true)}
          className="rounded-lg px-4 py-2 text-sm"
          style={
            isApplicable
              ? { backgroundColor: '#0A3D62', color: 'white' }
              : { border: '1px solid #d4d4d8' }
          }
        >
          Applicable
        </button>
        <button
          type="button"
          onClick={() => props.setSensitiveApplicable(false)}
          className="rounded-lg px-4 py-2 text-sm"
          style={
            !isApplicable
              ? { backgroundColor: '#0A3D62', color: 'white' }
              : { border: '1px solid #d4d4d8' }
          }
        >
          Not applicable
        </button>
      </div>
      {isApplicable && (
        <div className="space-y-2 pt-2">
          {OPTIONS.map((type) => (
            <label key={type} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={types.includes(type)}
                onChange={() => toggle(type)}
                className="h-4 w-4"
              />
              {type}
            </label>
          ))}
          <input
            type="text"
            value={props.sensitivePurpose}
            onChange={(e) => props.setSensitivePurpose(e.target.value)}
            placeholder="Purpose"
            className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
        </div>
      )}
    </div>
  );
}