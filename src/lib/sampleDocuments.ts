/**
 * DocuMatch AI - Sample Test Document Fixtures
 * High-quality documents designed to thoroughly test exact duplicate,
 * near duplicate, and unique document detection.
 */

export interface SampleDoc {
  name: string;
  type: 'txt';
  text: string;
  description: string;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    name: 'Mutual_NDA_Standard_2026.txt',
    type: 'txt',
    description: 'Original master non-disclosure agreement',
    text: `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of January 15, 2026 ("Effective Date"), by and between DocuMatch Technologies Inc., a Delaware corporation with its principal place of business at 100 Innovation Way, San Francisco, CA ("Disclosing Party"), and Apex Systems Corp., a California corporation ("Receiving Party").

1. PURPOSE
The parties wish to explore a potential business relationship concerning enterprise document intelligence software (the "Purpose").

2. CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public information disclosed by either party to the other, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.

3. OBLIGATIONS
The Receiving Party shall protect the Disclosing Party's Confidential Information with the same degree of care it uses for its own confidential information, but in no event less than reasonable care. The Receiving Party shall not disclose Confidential Information to any third party without prior written consent.

4. TERM AND TERMINATION
This Agreement shall remain in effect for a period of two (2) years from the Effective Date. The confidentiality obligations regarding trade secrets shall survive indefinitely.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles.

IN WITNESS WHEREOF, the parties have executed this Mutual Non-Disclosure Agreement as of the Effective Date.`,
  },
  {
    name: 'Mutual_NDA_Standard_2026_ExactCopy.txt',
    type: 'txt',
    description: 'Exact duplicate copy (100% SHA-256 match)',
    text: `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of January 15, 2026 ("Effective Date"), by and between DocuMatch Technologies Inc., a Delaware corporation with its principal place of business at 100 Innovation Way, San Francisco, CA ("Disclosing Party"), and Apex Systems Corp., a California corporation ("Receiving Party").

1. PURPOSE
The parties wish to explore a potential business relationship concerning enterprise document intelligence software (the "Purpose").

2. CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public information disclosed by either party to the other, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.

3. OBLIGATIONS
The Receiving Party shall protect the Disclosing Party's Confidential Information with the same degree of care it uses for its own confidential information, but in no event less than reasonable care. The Receiving Party shall not disclose Confidential Information to any third party without prior written consent.

4. TERM AND TERMINATION
This Agreement shall remain in effect for a period of two (2) years from the Effective Date. The confidentiality obligations regarding trade secrets shall survive indefinitely.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles.

IN WITNESS WHEREOF, the parties have executed this Mutual Non-Disclosure Agreement as of the Effective Date.`,
  },
  {
    name: 'Mutual_NDA_Standard_2026_Revised_v2.txt',
    type: 'txt',
    description: 'Near-duplicate (renegotiated terms, ~85% similarity)',
    text: `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT - REVISED VERSION 2

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of February 01, 2026 ("Effective Date"), by and between DocuMatch Technologies Inc., a Delaware corporation with its principal place of business at 100 Innovation Way, San Francisco, CA ("Disclosing Party"), and Apex Systems Corp., a Delaware corporation ("Receiving Party").

1. PURPOSE
The parties wish to explore an expanded partnership concerning document intelligence and data clustering integrations (the "Purpose").

2. CONFIDENTIAL INFORMATION
"Confidential Information" means all proprietary and non-public technical, business, and financial information disclosed by either party, designated in writing as confidential or clearly understood to be confidential.

3. OBLIGATIONS AND SECURITY SAFEGUARDS
The Receiving Party shall protect the Disclosing Party's Confidential Information using rigorous physical, electronic, and managerial safeguards. In no event shall protection fall below industry standards. No disclosure to external contractors without explicit mutual sign-off.

4. TERM AND TERMINATION
This Agreement shall remain in effect for a period of three (3) years from the Effective Date. The confidentiality obligations shall survive for five (5) years following termination.

5. GOVERNING LAW AND ARBITRATION
This Agreement shall be governed by the laws of the State of Delaware. Any dispute arising out of this Agreement shall be resolved through binding arbitration in Wilmington, Delaware.

IN WITNESS WHEREOF, authorized representatives have executed this Revised Agreement.`,
  },
  {
    name: 'Master_Services_Agreement_Cloud.txt',
    type: 'txt',
    description: 'Enterprise MSA (moderate topical legal overlap)',
    text: `MASTER SERVICES AGREEMENT FOR CLOUD OPERATIONS

This Master Services Agreement ("MSA") is entered into between CloudFlow Systems LLC ("Provider") and Apex Systems Corp. ("Customer").

1. SCOPE OF SERVICES
Provider agrees to deliver managed cloud architecture, automated replication pipelines, and high-availability database cluster monitoring as detailed in Statements of Work ("SOW") executed hereunder.

2. SERVICE LEVEL OBJECTIVES (SLO)
Provider guarantees 99.95% monthly uptime across production environments. In the event of downtime exceeding permitted thresholds, service credits shall be credited against subsequent monthly invoices.

3. FEES AND PAYMENT TERMS
Customer shall remit payments within thirty (30) days of receiving an itemized monthly invoice. Unpaid amounts shall accrue interest at 1.5% per month.

4. INTELLECTUAL PROPERTY RIGHTS
Customer retains sole ownership of all customer data, documents, and derived models. Provider retains ownership of preexisting tools, scripts, and platform engines.

5. LIMITATION OF LIABILITY
Neither party shall be liable for indirect, punitive, or consequential damages. Maximum aggregate liability shall not exceed fees paid in the prior twelve (12) months.`,
  },
  {
    name: 'Infrastructure_Invoice_INV-98214.txt',
    type: 'txt',
    description: 'Financial invoice (completely unique document)',
    text: `INVOICE #INV-98214
DATE: March 31, 2026
PAYMENT DUE: April 30, 2026

BILLED TO:
Apex Systems Corp.
Attn: Accounts Payable
742 Market Street, Suite 500
San Francisco, CA 94103

SERVICES RENDERED:
1. Enterprise GPU Cluster Compute (A100 instances, 720 hours) - $4,320.00
2. Distributed Vector Storage (2.5 TB provisioned SSD) - $450.00
3. Cross-Region Egress Bandwidth (14 TB @ $0.05/GB) - $700.00
4. Automated Backup Snapshot Retention (30 daily backups) - $125.00

SUBTOTAL: $5,595.00
TAX (8.5%): $475.58
TOTAL BALANCE DUE: $6,070.58

Remit payment via wire transfer to Silicon Valley Bank, Routing #121000358, Account #883920194. Thank you for your business.`,
  },
];
