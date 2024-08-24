import { Direction } from '../../enums/common.enum';
import { NoticeStatus, NoticeType } from '../../enums/notice.enum';

export interface NoticeInput {
	noticeType: NoticeType;
	noticeContent: string;
	noticeStatus: NoticeType;
	memberId?: string;
}

export interface NoticesInquiry {
	page: number | undefined;
	limit: number | undefined;
	sort?: string | undefined;
	direction?: Direction | undefined;
	noticeType?: NoticeType | undefined;
	noticeStatus?: NoticeStatus | undefined;
	text?: string | undefined;
}
