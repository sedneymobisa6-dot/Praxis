const OPTIONS = [
  { value: '<2M', label: 'Less than KES 2,000,000' },
  { value: '2M-5M', label: 'KES 2,000,000 - 5,000,000' },
  { value: '5M-10M', label: 'KES 5,000,000 - 10,000,000' },
  { value: '10M-50M', label: 'KES 10,000,000 - 50,000,000' },
  { value: '50M+', label: 'More than KES 50,000,000' },
];

type Props = {
  turnover: string;
  setTurnover: (v: string) => void;
};

export default function Step7Turnover(props: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-zinc-900">
        Previous year annual turnover
      </h2>
      {OPTIONS.map((option) => (
        <label key={option.value} className="flex items-center gap-3 text-sm">
          <input
            type="radio"
            name="turnover"
            checked={props.turnover === option.value}
            onChange={() => props.setTurnover(option.value)}
            className="h-4 w-4"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}