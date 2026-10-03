import type { Activity } from '../form';

type Props = {
  activities: Activity[];
  setActivities: (a: Activity[]) => void;
};

export default function Step2Activities(props: Props) {
  const activities = props.activities;

  function updateActivity(index: number, field: string, value: string) {
    const updated = [...activities];
    (updated[index] as any)[field] = value;
    props.setActivities(updated);
  }

  function addActivity() {
    const updated = [...activities];
    updated.push({
      data_subject_category: '',
      personal_data_description: '',
      purpose_of_processing: '',
    });
    props.setActivities(updated);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-zinc-900">
        Personal data processed
      </h2>
      {activities.map((activity, index) => (
        <div key={index} className="rounded-lg border border-zinc-200 p-4 space-y-3">
          <input
            type="text"
            value={activity.data_subject_category}
            onChange={(e) => updateActivity(index, 'data_subject_category', e.target.value)}
            placeholder="Category"
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            value={activity.personal_data_description}
            onChange={(e) => updateActivity(index, 'personal_data_description', e.target.value)}
            placeholder="Data collected"
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            value={activity.purpose_of_processing}
            onChange={(e) => updateActivity(index, 'purpose_of_processing', e.target.value)}
            placeholder="Purpose"
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addActivity}
        className="text-sm font-medium"
        style={{ color: '#0A3D62' }}
      >
        + Add another
      </button>
    </div>
  );
}