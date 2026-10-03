type Props = {
  postalAddress: string;
  setPostalAddress: (v: string) => void;
  telephone: string;
  setTelephone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  county: string;
  setCounty: (v: string) => void;
  legalEstablishment: string;
  setLegalEstablishment: (v: string) => void;
};

export default function Step1Basic(props: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-zinc-900">Basic details</h2>
      <input
        type="text"
        value={props.postalAddress}
        onChange={(e) => props.setPostalAddress(e.target.value)}
        placeholder="Postal address"
        className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
      />
      <input
        type="text"
        value={props.telephone}
        onChange={(e) => props.setTelephone(e.target.value)}
        placeholder="Telephone"
        className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
      />
      <input
        type="email"
        value={props.email}
        onChange={(e) => props.setEmail(e.target.value)}
        placeholder="Email"
        className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
      />
      <input
        type="text"
        value={props.county}
        onChange={(e) => props.setCounty(e.target.value)}
        placeholder="County"
        className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
      />
      <input
        type="text"
        value={props.legalEstablishment}
        onChange={(e) => props.setLegalEstablishment(e.target.value)}
        placeholder="Legal establishment"
        className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
      />
    </div>
  );
}