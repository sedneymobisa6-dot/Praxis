const OPTIONS = ['1-9', '10-49', '50-99', '99+'];

type Props = {
  employeeCount: string;
  setEmployeeCount: (v: string) => void;
};

export default function Step6Employees(props: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-zinc-900">Number of employees</h2>
      {OPTIONS.map((option) => (
        <label key={option} className="flex items-center gap-3 text-sm">
          <input
            type="radio"
            name="employeeCount"
            checked={props.employeeCount === option}
            onChange={() => props.setEmployeeCount(option)}
            className="h-4 w-4"
          />
          {option} employees
        </label>
      ))}
    </div>
  );
}