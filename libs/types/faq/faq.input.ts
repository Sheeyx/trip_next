import { FaqStatus } from '../../enums/faq.enum';
import { FaqType } from '../../enums/faq.enum';

export interface FaqInput {
	faqQuestion: string;
	faqAnswer: string;
	faqType: FaqType;
	faqStatus: FaqStatus;
	memberId?: string;
}

export interface FaqsInquiry {
	page: number | undefined;
	limit: number | undefined;
	sort: string;
	faqType?: FaqType | undefined;
	faqStatus?: FaqStatus | undefined;
	text?: string | undefined;
}
