import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { FaqStatus, FaqType } from '../../enums/faq.enum';

import { Member } from '../member/member';
import { TotalCounter } from '../property/property';

export interface Faq {
	_id: string;
	faqQuestion: string;
	faqAnswer: string;
	faqType: FaqType;
	faqStatus: FaqStatus;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	memberData?: Member;
}

export interface Faqs {
	list: Faq[];
	metaCounter: TotalCounter[];
}
