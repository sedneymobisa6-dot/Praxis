export const healthcareTemplate = {
  code: 'healthcare',
  title: 'Healthcare Sector',

  intro:
    'This Privacy Notice explains how this healthcare facility collects, uses, and protects personal data in accordance with the Data Protection Act, 2019, the Data Protection (General) Regulations, 2021, and the Office of the Data Protection Commissioner Guidance Note on Health Data (June 2024).',

  sensitiveDataSection: {
    heading: 'Sensitive Personal Data and Health Records',
    paragraphs: [
      'Health data is treated as sensitive personal data under Section 2 of the Data Protection Act, 2019. We process health data only where a lawful basis under Section 30 of the Act applies, and where one of the permitted grounds under Section 45 of the Act is satisfied.',
      'We process health data for the following purposes: providing medical care and treatment, maintaining patient medical records, processing insurance claims, responding to medical emergencies, complying with statutory reporting obligations to the Ministry of Health and other public health authorities, and carrying out medical research where permitted by law.',
      'Access to patient health records is restricted to authorised healthcare professionals and administrative personnel who require the information to carry out their duties. We apply role-based access controls, audit trails, and confidentiality obligations to all personnel who handle patient data.',
    ],
  },

  confidentialitySection: {
    heading: 'Professional Secrecy and Confidentiality',
    paragraphs: [
      'Our healthcare professionals are bound by professional secrecy under the Health Act and the Code of Professional Conduct issued by the relevant regulatory body. We require every member of staff, contractor, and volunteer who has access to patient data to sign a confidentiality undertaking.',
      'We do not disclose patient information to any third party except where the patient has given informed consent, where disclosure is required by law, or where disclosure is necessary to protect the vital interests of the patient or another person.',
      'Where we share patient data with a third party for a lawful purpose, we do so only on a need-to-know basis and only to the extent necessary for that purpose.',
    ],
  },

  nextOfKinSection: {
    heading: 'Next of Kin and Emergency Contacts',
    paragraphs: [
      'We collect the name, contact details, and relationship of a next of kin or emergency contact so that we can reach a responsible person if a patient is unable to communicate or requires urgent medical attention.',
      'Next of kin and emergency contact information is processed only for this purpose. It is not used for marketing or any other commercial purpose.',
      'Where a patient is a minor or is otherwise unable to give consent, the parent, legal guardian, or next of kin acts on the patient\u2019s behalf within the limits set out in the Act.',
    ],
  },

  childrensHealthSection: {
    heading: 'Children\u2019s Health Data',
    paragraphs: [
      'We process the health data of children only with the consent of a parent or legal guardian, except where the law requires us to provide emergency care without consent.',
      'We verify the identity and authority of any person giving consent on behalf of a child.',
      'We do not disclose a child\u2019s health data to a third party, including a school or an employer, without the written consent of a parent or legal guardian, unless the law requires disclosure.',
    ],
  },

  researchSection: {
    heading: 'Medical Research and Public Health',
    paragraphs: [
      'Where we process personal data for medical research, public health, or statistical purposes, we do so only where the processing satisfies Section 30 of the Act and, where required, Section 53 of the Act. We apply safeguards including pseudonymisation, restricted access, and ethics committee review.',
      'We do not publish research results in a form that identifies a patient without the patient\u2019s explicit consent.',
    ],
  },

  insuranceSection: {
    heading: 'Insurance Claims and Third-Party Payers',
    paragraphs: [
      'Where a patient\u2019s treatment is funded by an insurer, an employer, or another third-party payer, we share only the minimum personal data necessary to process the claim.',
      'We require every third-party payer to process the shared data in accordance with the Data Protection Act, 2019 and to maintain confidentiality. Where required, we enter into a written Data Processing Agreement.',
    ],
  },

  lawfulBasisNote:
    'For healthcare facilities, the lawful bases for processing personal data under Section 30 of the Act most commonly relied on are: consent (for general treatment and for sharing information with third parties); performance of a contract (for the provision of healthcare services); legal obligation (for statutory reporting to the Ministry of Health, the Kenya Medical Practitioners and Dentists Council, and other public bodies); vital interests (for emergency care); and public interest (for public health purposes). Processing of health data is additionally subject to Section 45 of the Act.',

  retentionNote:
    'We retain patient medical records for the period required by the Health Act, the Kenya Medical Practitioners and Dentists Council guidelines, and other applicable legislation. When personal data is no longer required, we securely delete, erase, or anonymise it in accordance with our retention schedule.',

  additionalNotes: [
    'Registration with the ODPC is mandatory for healthcare facilities regardless of size or annual turnover.',
    'We carry out Data Protection Impact Assessments before deploying any system or process that is likely to result in a high risk to the rights and freedoms of data subjects, including electronic medical records, telemedicine platforms, and biometric identification systems.',
    'We respond to data subject access requests within the timelines set out in the Data Protection (General) Regulations, 2021. Access requests are responded to within 7 days.',
    'In the event of a personal data breach that presents a real risk of harm to data subjects, we notify the Office of the Data Protection Commissioner within 72 hours of becoming aware of the breach.',
  ],
};