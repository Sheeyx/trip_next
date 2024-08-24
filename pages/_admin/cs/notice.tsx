import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Button, InputAdornment, Stack } from '@mui/material';
import { List, ListItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { NoticeArticlesPanelList } from '../../../libs/components/admin/cs/NoticeList';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { T } from '../../../libs/types/common';
import { Notice, Notices } from '../../../libs/types/notice/notice';
import { NoticesInquiry } from '../../../libs/types/notice/notice.input';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { DELETE_NOTICE_BY_ADMIN, UPDATE_NOTICE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { NoticeUpdate } from '../../../libs/types/notice/notice.update';
import { GET_FAQS, GET_NOTICES } from '../../../apollo/user/query';
import { NoticeStatus, NoticeType } from '../../../libs/enums/notice.enum';
import { Search, Sort } from '@mui/icons-material';
import { Direction } from '../../../libs/enums/common.enum';

interface NoticeArticlesProps {
	initialInquiry?: {
		page?: number;
		limit?: number;
		noticeType?: string;
	};
}

const NoticeArticles: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const router = useRouter();
	const [noticesInquiry, setNoticesInquiry] = useState<NoticesInquiry>(initialInquiry);
	const [type, setType] = useState<string>('MOTORCYCLE');

	const [noticesTotal, setNoticesTotal] = useState<number>(0);
	const [value, setValue] = useState('ALL');
	const [searchType, setSearchType] = useState('ALL');
	const [searchText, setSearchText] = useState('');

	const [notices, setNotices] = useState<Notices[]>([]);
	const [total, setTotal] = useState<number>(0);
	const dense = false;

	/** APOLLO REQUESTS **/
	const [updateNoticeByAdmin, { error: createError }] = useMutation(UPDATE_NOTICE_BY_ADMIN, {
		onError: (error) => {
			router.push('/_error');
		},
	});
	const [deleteNoticeByAdmin, { error: createDeleteError }] = useMutation(DELETE_NOTICE_BY_ADMIN, {
		onError: (error) => {
			router.push('/_error');
		},
	});
	const {
		loading: getNoticesLoading,
		data: getNoticesData,
		refetch: getNoticesRefetch,
		error: getNoticesError,
	} = useQuery(GET_NOTICES, {
		fetchPolicy: 'network-only', // by default cache-first
		variables: { input: { ...noticesInquiry } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setNotices(data?.getNotices?.list || []);
			setTotal(data?.getNotices?.metaCounter[0]?.total || 0);
		},
	});

	if (getNoticesError) {
		router.push('/_error');
	}

	console.log(noticesInquiry, 'GET NOTICES');

	/** LIFECYCLES **/
	useEffect(() => {
		getNoticesRefetch({ input: noticesInquiry }).then();
	}, [noticesInquiry]);

	/** HANDLERS **/

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);

		setNoticesInquiry({ ...noticesInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'ACTIVE':
				setNoticesInquiry({ ...noticesInquiry, noticeStatus: NoticeStatus.ACTIVE });
				break;
			case 'HOLD':
				setNoticesInquiry({ ...noticesInquiry, noticeStatus: NoticeStatus.HOLD });
				break;
			case 'DELETE':
				setNoticesInquiry({ ...noticesInquiry, noticeStatus: NoticeStatus.DELETE });
				break;
			default:
				delete noticesInquiry?.noticeStatus;
				setNoticesInquiry({ ...noticesInquiry });
				break;
		}
	};

	const removeNoticeHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await deleteNoticeByAdmin({
					variables: {
						input: id,
					},
				});

				await getNoticesRefetch({ input: noticesInquiry });
			}
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const textHandler = useCallback((value: string) => {
		try {
			setSearchText(value);
		} catch (err: any) {
			console.log('textHandler: ', err.message);
		}
	}, []);

	const searchTextHandler = () => {
		try {
			setNoticesInquiry({
				...noticesInquiry,
				text: searchText,
			});
		} catch (err: any) {
			console.log('searchTextHandler: ', err.message);
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			const formattedValue = newValue.replace(/ /g, '_').toUpperCase();

			setSearchType(newValue);

			if (newValue !== 'ALL') {
				const newInquiry = {
					...noticesInquiry,
					page: 1,
					sort: 'createdAt',
					noticeType: formattedValue as NoticeType,
				};

				setNoticesInquiry(newInquiry);
			} else {
				delete noticesInquiry?.noticeType;
				setNoticesInquiry({ ...noticesInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler:', err.message);
			router.push('/_error');
		}
	};

	const updateNoticeHandler = async (updateData: NoticeUpdate) => {
		try {
			console.log('+updateData: ');
			await updateNoticeByAdmin({
				variables: {
					input: updateData,
				},
			});
			menuIconCloseHandler();
			await getNoticesRefetch({ input: noticesInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};
	return (
		<>
			<Box component={'div'} className={'content'}>
				<Box component={'div'} className={'title flex_space'}>
					<Typography variant={'h2'}>Notice Management</Typography>
					<Button
						className="btn_add"
						variant={'contained'}
						size={'medium'}
						onClick={() => router.push(`/_admin/cs/notice_create`)}
					>
						<AddRoundedIcon sx={{ mr: '8px' }} />
						ADD
					</Button>
				</Box>
				<Box component={'div'} className={'table-wrap'}>
					<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
						<TabContext value={'value'}>
							<Box component={'div'}>
								<List className={'tab-menu'}>
									<ListItem
										onClick={(e: any) => tabChangeHandler(e, 'ALL')}
										value="ALL"
										className={value === 'ALL' ? 'li on' : 'li'}
									>
										All
									</ListItem>
									<ListItem
										onClick={(e: any) => tabChangeHandler(e, 'ACTIVE')}
										value="ACTIVE"
										className={value === 'ACTIVE' ? 'li on' : 'li'}
									>
										Active
									</ListItem>
									<ListItem
										onClick={(e: any) => tabChangeHandler(e, 'HOLD')}
										value="HOLD"
										className={value === 'HOLD' ? 'li on' : 'li'}
									>
										Hold
									</ListItem>
									<ListItem
										onClick={(e: any) => tabChangeHandler(e, 'DELETE')}
										value="DELETE"
										className={value === 'DELETE' ? 'li on' : 'li'}
									>
										Deleted
									</ListItem>
								</List>
								<Divider />
								<Stack className={'search-area'} sx={{ m: '24px' }}>
									<Select sx={{ width: '160px', mr: 's20px' }} value={searchType}>
										<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
											ALL
										</MenuItem>
										{Object.values(NoticeType).map((type: string) => (
											<MenuItem value={type} onClick={() => searchTypeHandler(type)} key={type}>
												{type}
											</MenuItem>
										))}
									</Select>

									<OutlinedInput
										value={searchText}
										onChange={(e: any) => textHandler(e.target.value)}
										sx={{ width: '100%' }}
										className={'search'}
										placeholder="Search user name"
										onKeyDown={(event) => {
											if (event.key == 'Enter') searchTextHandler();
										}}
										endAdornment={
											<>
												{searchText && (
													<CancelRoundedIcon
														style={{ cursor: 'pointer' }}
														onClick={async () => {
															setSearchText('');
															setNoticesInquiry({
																...noticesInquiry,
																text: '',
															});
															await getNoticesRefetch({ input: noticesInquiry });
														}}
													/>
												)}
												<InputAdornment position="end" onClick={() => searchTextHandler()}>
													<img src="/img/icons/search_icon.png" alt={'searchIcon'} />
												</InputAdornment>
											</>
										}
									/>
								</Stack>
								<Divider />
							</Box>
							<NoticeArticlesPanelList
								notices={notices}
								anchorEl={anchorEl}
								menuIconClickHandler={menuIconClickHandler}
								menuIconCloseHandler={menuIconCloseHandler}
								updateNoticeHandler={updateNoticeHandler}
								removeNoticeHandler={removeNoticeHandler}
							/>

							<TablePagination
								rowsPerPageOptions={[10, 20, 30]}
								component="div"
								count={4}
								rowsPerPage={10}
								page={0}
								onPageChange={() => {}}
								onRowsPerPageChange={() => {}}
							/>
						</TabContext>
					</Box>
				</Box>
			</Box>
		</>
	);
};

NoticeArticles.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
	},
};

export default withAdminLayout(NoticeArticles);
