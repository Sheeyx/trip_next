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
import { FaqArticlesPanelList } from '../../../libs/components/admin/cs/FaqList';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { T } from '../../../libs/types/common';
import { Faq, Faqs } from '../../../libs/types/faq/faq';
import { FaqsInquiry } from '../../../libs/types/faq/faq.input';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { DELETE_FAQ_BY_ADMIN, UPDATE_FAQ_BY_ADMIN } from '../../../apollo/admin/mutation';
import { FaqUpdate } from '../../../libs/types/faq/faq.update';
import { GET_FAQS } from '../../../apollo/user/query';
import { FaqStatus, FaqType } from '../../../libs/enums/faq.enum';

interface FaqArticlesProps {
	initialInquiry?: {
		page?: number;
		limit?: number;
		faqType?: string;
	};
}

const FaqArticles: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const router = useRouter();
	const [faqsInquiry, setFaqsInquiry] = useState<FaqsInquiry>(initialInquiry);
	const [type, setType] = useState<string>('MOTORCYCLE');

	const [faqsTotal, setFaqsTotal] = useState<number>(0);
	const [value, setValue] = useState('ALL');
	const [searchType, setSearchType] = useState('ALL');
	const [searchText, setSearchText] = useState('');

	const [faqs, setFaqs] = useState<Faqs[]>([]);
	const [total, setTotal] = useState<number>(0);
	const dense = false;

	/** APOLLO REQUESTS **/
	const [updateFaqByAdmin, { error: createError }] = useMutation(UPDATE_FAQ_BY_ADMIN, {
		onError: (error) => {
			router.push('/_error');
		},
	});

	const [deleteFaqByAdmin, { error: createDeleteError }] = useMutation(DELETE_FAQ_BY_ADMIN, {
		onError: (error) => {
			router.push('/_error');
		},
	});

	const {
		loading: getFaqsLoading,
		data: getFaqsData,
		refetch: getFaqsRefetch,
		error: getFaqsError,
	} = useQuery(GET_FAQS, {
		fetchPolicy: 'network-only', // by default cache-first
		variables: { input: { ...faqsInquiry, faqType: type.toUpperCase() } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFaqs(data?.getFaqs?.list || []);
			setTotal(data?.getFaqs?.metaCounter[0]?.total || 0);
		},
	});

	if (getFaqsError) {
		router.push('/_error');
	}
	/** LIFECYCLES **/
	useEffect(() => {
		getFaqsRefetch({ input: faqsInquiry }).then();
	}, [faqsInquiry]);

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

		setFaqsInquiry({ ...faqsInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'ACTIVE':
				setFaqsInquiry({ ...faqsInquiry, faqStatus: FaqStatus.ACTIVE });
				break;
			case 'HOLD':
				setFaqsInquiry({ ...faqsInquiry, faqStatus: FaqStatus.HOLD });
				break;
			case 'DELETE':
				setFaqsInquiry({ ...faqsInquiry, faqStatus: FaqStatus.DELETE });
				break;
			default:
				delete faqsInquiry?.faqStatus;
				setFaqsInquiry({ ...faqsInquiry });
				break;
		}
	};

	const removeFaqHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await deleteFaqByAdmin({
					variables: {
						input: id,
					},
				});

				await getFaqsRefetch({ input: faqsInquiry });
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
			setFaqsInquiry({
				...faqsInquiry,
				text: searchText,
			});
		} catch (err: any) {
			console.log('searchTextHandler: ', err.message);
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setFaqsInquiry({
					...faqsInquiry,
					page: 1,
					sort: 'createdAt',
					faqType: newValue.toUpperCase() as FaqType,
				});
			} else {
				delete faqsInquiry?.faqType;
				setFaqsInquiry({ ...faqsInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updateFaqHandler = async (updateData: FaqUpdate) => {
		try {
			console.log('+updateData: ');
			await updateFaqByAdmin({
				variables: {
					input: updateData,
				},
			});
			menuIconCloseHandler();
			await getFaqsRefetch({ input: faqsInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};
	return (
		<>
			<Box component={'div'} className={'content'}>
				<Box component={'div'} className={'title flex_space'}>
					<Typography variant={'h2'}>FAQ Management</Typography>
					<Button
						className="btn_add"
						variant={'contained'}
						size={'medium'}
						onClick={() => router.push(`/_admin/cs/faq_create`)}
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
										HOLD
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
									<Select sx={{ width: '160px', mr: '20px' }} value={searchType}>
										<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
											ALL
										</MenuItem>
										{Object.values(FaqType).map((type: string) => (
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
															setFaqsInquiry({
																...faqsInquiry,
																text: '',
															});
															await getFaqsRefetch({ input: faqsInquiry });
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
							<FaqArticlesPanelList
								faqs={faqs}
								anchorEl={anchorEl}
								menuIconClickHandler={menuIconClickHandler}
								menuIconCloseHandler={menuIconCloseHandler}
								updateFaqHandler={updateFaqHandler}
								removeFaqHandler={removeFaqHandler}
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

FaqArticles.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
	},
};

export default withAdminLayout(FaqArticles);
