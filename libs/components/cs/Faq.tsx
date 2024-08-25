import React, { SyntheticEvent, useState, useEffect } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useQuery } from '@apollo/client';
import { GET_NOTICES } from '../../../apollo/user/query'; // Make sure the query is correctly imported
import { NoticeType } from '../../enums/notice.enum';

interface NoticesListProps {
	initialInput?: {
		page?: number;
		limit?: number;
	};
}

interface Notice {
	_id: string;
	noticeType: string;
	noticeContent: string;
	createdAt: string;
}

const formatDate = (dateString: string | number | Date) => {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}.${month}.${day}`;
};

// Styled component for NoticeType with conditional styles
const NoticeTypeSpan = styled('span', {
	shouldForwardProp: (prop) => prop !== 'noticeType',
})<{ noticeType: string }>(({ noticeType }) => {
	const commonStyles = {
		padding: '5px 10px',
		border: '1px solid',
		borderRadius: '15px',
	};

	const typeStyles: Record<string, any> = {
		[NoticeType.PROMOTION]: {
			...commonStyles,
			borderColor: '#d31a1a',
			color: '#d31a1a',
		},
		[NoticeType.NEW_ARRIVAL]: {
			...commonStyles,
			borderColor: '#1a73e8',
			color: '#1a73e8',
		},
		[NoticeType.MAINTENANCE]: {
			...commonStyles,
			borderColor: '#ff9800',
			color: '#ff9800',
		},
		[NoticeType.SAFETY]: {
			...commonStyles,
			borderColor: '#4caf50',
			color: '#4caf50',
		},
		[NoticeType.WEBSITE_UPDATE]: {
			...commonStyles,
			borderColor: '#9c27b0',
			color: '#9c27b0',
		},
		[NoticeType.LEGAL_POLICY]: {
			...commonStyles,
			borderColor: '#ff5722',
			color: '#ff5722',
		},
		[NoticeType.GENERAL_ANNOUNCEMENT]: {
			...commonStyles,
			borderColor: '#795548',
			color: '#795548',
		},
	};

	return typeStyles[noticeType] || {};
});

const Faq: React.FC<NoticesListProps> = ({ initialInput = { page: 1, limit: 10 } }) => {
	const device = useDeviceDetect();
	const [notices, setNotices] = useState<Notice[]>([]);
	const [total, setTotal] = useState<number>(0);
	const router = useRouter();
	const [currentPage, setCurrentPage] = useState<number>(initialInput.page || 1);
	const [expanded, setExpanded] = useState<string | false>(false);
	const [category, setCategory] = useState<string>('property');

	/** APOLLO REQUESTS **/
	const {
		loading: getNoticesLoading,
		data: getNoticesData,
		error: getNoticesError,
		refetch: getNoticesRefetch,
	} = useQuery(GET_NOTICES, {
		fetchPolicy: 'network-only',
		variables: { input: { page: currentPage, limit: initialInput.limit } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setNotices(data?.getNotices?.list || []);
			setTotal(data?.getNotices?.metaCounter[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const handleChange = (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
		setExpanded(isExpanded ? panel : false);
	};

	const changeCategoryHandler = (newCategory: string) => {
		setCategory(newCategory);
		setExpanded(false); // Collapse all accordions when switching categories
		// Optionally, you can refetch data if the category affects the query
	};

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			// Set filters or page based on the query input
		}
	}, [router]);

	/** CONDITIONAL RENDERING **/
	if (device === 'mobile') {
		return <div>FAQ MOBILE</div>;
	} else {
		return (
			<Stack className={'faq-content'}>
				<Box className={'categories'} component={'div'}>
					{['property', 'payment', 'buyers', 'agents', 'membership', 'community', 'other'].map((cat) => (
						<div
							key={cat}
							className={category === cat ? 'active' : ''}
							onClick={() => changeCategoryHandler(cat)}
						>
							{cat.charAt(0).toUpperCase() + cat.slice(1)}
						</div>
					))}
				</Box>
				<Box className={'wrap'} component={'div'}>
					{notices.map((notice) => (
						<Accordion expanded={expanded === notice._id} onChange={handleChange(notice._id)} key={notice._id}>
							<AccordionSummary id={`panel-${notice._id}`} className="question" aria-controls={`panel-${notice._id}-content`}>
								<Typography className="badge" variant={'h4'}>
									<NoticeTypeSpan noticeType={notice.noticeType}>{notice.noticeType}</NoticeTypeSpan>
								</Typography>
								<Typography>{notice.noticeContent}</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<Stack className={'answer flex-box'}>
									<Typography className="badge" variant={'h4'} color={'primary'}>
										{formatDate(notice.createdAt)}
									</Typography>
									<Typography>{notice.noticeContent}</Typography>
								</Stack>
							</AccordionDetails>
						</Accordion>
					))}
				</Box>
			</Stack>
		);
	}
};

export default Faq;
