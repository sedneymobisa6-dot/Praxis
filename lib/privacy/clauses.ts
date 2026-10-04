export type Clause = {
  heading: string;
  paragraphs: string[];
};

export const clauses: Record<string, Clause> = {
  sacco: {
    heading: 'SACCO Members and Financial Records',
    paragraphs: [
      'As a licensed SACCO, we process the personal data of our members to provide savings, credit, and other financial services. This includes identity information, KYC data, member account details, transaction history, and information about loans, guarantees, and shares.',
      'Member data is processed for the purpose of managing membership, providing financial services, complying with the SACCO Societies Act and the SACCO Societies Regulatory Authority (SASRA) requirements, and fulfilling our obligations under POCAMLA.',
      'We share member information with credit reference bureaus where required by law. We do not share member data with third parties for marketing purposes without explicit consent.',
    ],
  },

  insurance: {
    heading: 'Insurance Policyholders, Beneficiaries, and Claimants',
    paragraphs: [
      'As an insurance provider, we process the personal data of policyholders, beneficiaries, claimants, and third parties involved in claims. This includes identity data, health data, financial data, and information about the insured risk.',
      'Insurance data is processed for the purpose of underwriting policies, assessing claims, complying with the Insurance Act and the Insurance Regulatory Authority (IRA) requirements, and fulfilling our obligations under POCAMLA.',
      'Where claims involve medical information, we process health data in accordance with Section 45 of the Act. We share information with reinsurers, medical service providers, and fraud investigation agencies only to the extent necessary for the disclosed purpose.',
    ],
  },

  debt: {
    heading: 'Debt Collection and Credit Reference',
    paragraphs: [
      'We process the personal data of debtors and credit customers for the purpose of collecting debts owed to us or to our clients, and for reporting credit information to licensed credit reference bureaus under the Credit Reference Bureau Regulations, 2020.',
      'Debt collection data is processed only for the purpose of recovering amounts owed. We do not contact a debtor more than is reasonably necessary, and we do not disclose information about a debtor to third parties who have no lawful purpose for receiving it.',
      'Debtors have the right to access the personal data we hold about them, to request correction of inaccurate information, and to lodge a complaint with the Office of the Data Protection Commissioner where they believe their data has been mishandled.',
    ],
  },

  hospitality: {
    heading: 'Guests and Hospitality Services',
    paragraphs: [
      'We process the personal data of guests, event attendees, and visitors for the purpose of providing accommodation, food and beverage services, event services, and complying with legal obligations under the Hotels and Restaurants Act and the Immigration Act.',
      'We collect guest identity information, booking details, payment information, and CCTV footage in public areas of our premises. CCTV is used only for the safety and security of guests, staff, and property. We do not install cameras in guest rooms, bathrooms, or other private areas.',
      'We retain guest records for the period required by law. CCTV footage is retained only for the period necessary for the purpose for which it was collected. Guest data is not shared with third parties for marketing purposes without consent.',
    ],
  },

  property: {
    heading: 'Property Management and Real Estate',
    paragraphs: [
      'We process the personal data of tenants, landlords, property owners, buyers, sellers, and applicants for the purpose of property management, letting, sale, and related services.',
      'Property data includes identity information, financial data, contact details, lease information, and information about property viewings and maintenance requests. We process this data to manage tenancies, complete transactions, comply with the Land Registration Act, and fulfil our obligations under tax and anti-money laundering laws.',
      'We do not share property data with third parties except where necessary to complete a transaction, comply with the law, or where the data subject has given consent.',
    ],
  },

  cctv: {
    heading: 'Security Services and CCTV Surveillance',
    paragraphs: [
      'As a security service provider, we process personal data captured by CCTV surveillance, access control systems, and manned guarding operations. This processing is carried out for the purpose of crime prevention and the protection of persons and property, which is a purpose specified in the Third Schedule to the Registration Regulations.',
      'CCTV footage is processed in accordance with the ODPC Guidance Note for the Private Security Sector (2025). We display clear notices at monitored premises, limit access to footage to authorised personnel, and retain footage only for the period necessary for the purpose for which it was collected.',
      'We do not place cameras in areas where a person has a reasonable expectation of privacy, including washrooms, changing areas, and prayer rooms. Where biometric data is used for access control, we apply additional safeguards in accordance with the ODPC Guidance Note on Biometric Data (2025).',
    ],
  },

  faith: {
    heading: 'Faith Organisations and Religious Data',
    paragraphs: [
      'As a faith organisation, we process the personal data of members, volunteers, donors, and beneficiaries for the purpose of managing membership, providing spiritual services, organising events, and managing charitable activities.',
      'Where we process information about a person\u2019s religious beliefs or affiliations, this is sensitive personal data under Section 2 of the Act. We process such data only with the explicit consent of the data subject, or where the processing falls within one of the permitted grounds under Section 45 of the Act.',
      'We do not disclose a member\u2019s religious affiliation, membership status, or giving records to any third party without consent, except where disclosure is required by law.',
    ],
  },

  marketing: {
    heading: 'Direct Marketing and Consent',
    paragraphs: [
      'We process contact information for the purpose of direct marketing by SMS, email, WhatsApp, and other channels. Under Section 37 of the Act and Regulation 15 of the Data Protection (General) Regulations, 2021, we may only send direct marketing communications to a person who has given prior express consent, or where the person is an existing customer and the marketing relates to similar products or services.',
      'Every direct marketing message we send includes a clear and easily accessible opt-out mechanism. Where a person opts out, we cease using their personal data for direct marketing purposes within the time required by law, and we do not sell or disclose the personal data to a third party for marketing purposes.',
      'We do not use automated calling systems or send marketing messages that conceal the identity of the sender. We maintain a register of opt-out requests and honour them without requiring the data subject to take further action.',
    ],
  },

  transport: {
    heading: 'Transport Services, Drivers, and Passengers',
    paragraphs: [
      'We process the personal data of passengers, drivers, riders, and staff for the purpose of providing transport services. This includes identity information, contact details, payment information, trip and location data, and vehicle records.',
      'Location data is processed to facilitate trips, calculate fares, ensure safety, and comply with the National Transport and Safety Authority (NTSA) requirements. We do not process location data beyond what is necessary for these purposes, and we do not sell location data to third parties.',
      'Driver and rider data is processed for the purpose of onboarding, background checks, and regulatory compliance. We comply with the ODPC Transport Sector Guidance Note and any applicable NTSA requirements.',
    ],
  },

  telecom: {
    heading: 'Telecommunications and Internet Services',
    paragraphs: [
      'As a telecommunications or internet service provider, we process the personal data of subscribers, customers, and users for the purpose of providing network services, billing, customer support, and complying with the Kenya Information and Communications Act and the Communications Authority of Kenya requirements.',
      'We process communications metadata, including call records, data usage, and network location, only to the extent necessary for billing, network management, security, and compliance with lawful requests from authorised bodies.',
      'We do not access the content of communications except where required by law and under a valid legal process. We apply safeguards in accordance with the ODPC Guidance Note for the Communication Sector.',
    ],
  },

  gaming: {
    heading: 'Gaming and Betting Operators',
    paragraphs: [
      'As a licensed gaming or betting operator, we process the personal data of customers to provide gaming services, verify age and identity, process payments, and comply with the Betting, Lotteries and Gaming Act and the Betting Control and Licensing Board (BCLB) requirements.',
      'We process financial data, identity data, and information about a customer\u2019s gaming activity. We apply behavioural monitoring to detect problem gambling and to comply with responsible gambling obligations, and we may restrict or suspend an account where required by law.',
      'We do not use customer data for marketing to persons who have self-excluded, and we do not disclose customer data to third parties except where required by law or where the customer has given consent.',
    ],
  },

  genetic: {
    heading: 'Genetic Data Processing',
    paragraphs: [
      'We process genetic data, which is sensitive personal data under Section 2 of the Act. Genetic data is processed only where one of the permitted grounds under Section 45 of the Act applies, and we apply the highest safeguards available to protect it.',
      'Genetic data is processed only for the specific purpose disclosed to the data subject, which may include medical diagnosis, medical research, or forensic identification where permitted by law.',
      'We do not disclose genetic data to any third party without the explicit consent of the data subject, except where disclosure is required by law. We apply pseudonymisation, restricted access, and encryption to all genetic data.',
    ],
  },
};