export const financeTemplate = {
  code: 'finance',
  title: 'Financial Services Sector',

  intro:
    'This Privacy Notice explains how this institution collects, uses, and protects personal data in accordance with the Data Protection Act, 2019, the Data Protection (General) Regulations, 2021, and the Office of the Data Protection Commissioner Guidance Note for Digital Credit Providers (December 2023).',

  kycSection: {
    heading: 'Know Your Customer (KYC) and Identity Verification',
    paragraphs: [
      'As a regulated financial institution, we are required by law to verify the identity of our customers and members. This includes collecting a copy of a national identification document, a KRA PIN certificate, a passport photograph, and proof of address.',
      'Identity information is processed for the purpose of complying with the Proceeds of Crime and Anti Money Laundering Act, 2009 (POCAMLA), the Anti Money Laundering Regulations, 2023, and guidelines issued by the Financial Reporting Centre. This processing is necessary for compliance with a legal obligation to which we are subject.',
      'We apply a risk based approach to customer due diligence. Enhanced measures are applied where a transaction or customer profile presents a higher risk. Where the law does not require enhanced measures, we do not demand more data than is necessary for the purpose.',
      'We do not use KYC information for any purpose other than the specific regulatory and service purposes for which it was collected.',
    ],
  },

  amlSection: {
    heading: 'Anti Money Laundering and Suspicious Activity Reporting',
    paragraphs: [
      'We are required to monitor transactions for indications of money laundering, terrorism financing, and proliferation financing. This involves the analysis of transaction data, source of funds, and customer behaviour.',
      'Where we identify activity that meets the reporting threshold, we file a Suspicious Activity Report with the Financial Reporting Centre. We do not inform the customer that a report has been filed, as this is prohibited by law.',
      'Section 17 of POCAMLA overrides obligations of secrecy in any other law, in so far as those obligations relate to the management of proceeds of crime and the enforcement of anti money laundering measures.',
    ],
  },

  creditSection: {
    heading: 'Credit Information and Credit Reference Bureaus',
    paragraphs: [
      'Where we provide credit or enter into a credit facility with a customer, we may share information on the performance of that facility with licensed credit reference bureaus in accordance with the Credit Reference Bureau Regulations, 2020.',
      'We only share the minimum personal data necessary for the credit reference bureau to perform its statutory function. We do not share information that is not relevant to the customer credit standing.',
      'A customer has the right to request a copy of the information we have shared with a credit reference bureau and to request correction of any inaccurate information.',
    ],
  },

  crossBorderSection: {
    heading: 'Cross Border Transfers',
    paragraphs: [
      'Some of our operations involve the transfer of personal data to group entities, service providers, or payment processors located outside Kenya. Before any such transfer takes place, we confirm that appropriate safeguards are in place as required by Section 48 of the Data Protection Act, 2019 and Regulation 40 of the Data Protection (General) Regulations, 2021.',
      'We do not transfer personal data to a jurisdiction that does not provide an adequate level of protection unless the transfer is based on an approved safeguard, a contractual arrangement, or the explicit consent of the data subject.',
    ],
  },

  securityMeasuresSection: {
    heading: 'Data Security Measures',
    paragraphs: [
      'In accordance with the ODPC Guidance Note for Digital Credit Providers, we have implemented specific technical and organisational security measures to protect your personal data against unauthorised access, loss, or alteration.',
      'These measures include the encryption of sensitive data both at rest and in transit, the use of pseudonymisation where full data is not required, strict role based access controls that ensure employees only access data necessary for their duties, and regular security audits of our systems.',
      'All our staff are bound by confidentiality agreements and undergo regular training on data protection and information security practices.',
    ],
  },

  fraudSection: {
    heading: 'Fraud Prevention and Investigation',
    paragraphs: [
      'We process personal data for the purpose of detecting, preventing, and investigating fraud and other criminal activity. This processing is necessary for compliance with a legal obligation and for the protection of our legitimate interests and those of our customers.',
      'We may share information with law enforcement agencies, the Financial Reporting Centre, and other financial institutions where required by law or where necessary to prevent fraud.',
    ],
  },

  lawfulBasisNote:
    'For institutions in the financial services sector, the lawful bases for processing personal data under Section 30 of the Act most commonly relied on are: legal obligation (for KYC, AML, credit reporting, and statutory reporting); performance of a contract (for the provision of financial services); consent (for marketing and for any optional use of personal data); and legitimate interests (for fraud prevention and internal analytics, where those interests are not overridden by the rights of the data subject).',

  retentionNote:
    'We retain customer records for the period required by POCAMLA, the Companies Act, and other applicable legislation. Records of transactions are retained for a minimum of seven years from the date the transaction was completed or from the date the customer relationship ended. When personal data is no longer required, we securely delete, erase, or anonymise it in accordance with our formal retention schedule under Regulation 19.',

  additionalNotes: [
    'Registration with the ODPC is mandatory for financial services institutions regardless of size or annual turnover.',
    'Where we engage a data processor, we enter into a written Data Processing Agreement requiring the processor to process personal data only on our instructions and to apply appropriate technical and organisational safeguards.',
    'You have the right to access your personal data. We respond to access requests within 7 days as required by the Data Protection (General) Regulations, 2021.',
    'You have the right to lodge a complaint with the Office of the Data Protection Commissioner if you believe your personal data has been mishandled. Our internal complaints mechanism is also available to you.',
    'In the event of a personal data breach that presents a real risk of harm to data subjects, we notify the Office of the Data Protection Commissioner within 72 hours of becoming aware of the breach.',
  ],
};