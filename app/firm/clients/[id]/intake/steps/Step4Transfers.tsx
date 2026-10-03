type Props = {
  transferApplicable: boolean;
  setTransferApplicable: (v: boolean) => void;
  transferCountries: string;
  setTransferCountries: (v: string) => void;
};

export default function Step4Transfers(props: Props) {
  const isApplicable = props.transferApplicable;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-zinc-900">
        Transfers outside Kenya
      </h2>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => props.setTransferApplicable(true)}
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
          onClick={() => props.setTransferApplicable(false)}
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
        <input
          type="text"
          value={props.transferCountries}
          onChange={(e) => props.setTransferCountries(e.target.value)}
          placeholder="Countries, comma separated"
          className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
        />
      )}
    </div>
  );
}