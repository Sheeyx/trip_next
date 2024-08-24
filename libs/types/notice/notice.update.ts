import { NoticeStatus, NoticeType } from '../../enums/notice.enum';

export interface NoticeUpdate {
	_id: string;
	noticeContent?: string;
	noticeType?: NoticeType;
	noticeStatus?: NoticeStatus;
}
