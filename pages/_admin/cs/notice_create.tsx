import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_FAQ, GET_NOTICE } from '../../../apollo/user/query';
import { getJwtToken } from '../../../libs/auth';
import useDeviceDetect from '../../../libs/hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { NoticeStatus, NoticeType } from '../../../libs/enums/notice.enum';
import {
	CREATE_FAQ_BY_ADMIN,
	CREATE_NOTICE_BY_ADMIN,
	UPDATE_FAQ_BY_ADMIN,
	UPDATE_NOTICE_BY_ADMIN,
} from '../../../apollo/admin/mutation';
import { NoticeInput } from '../../../libs/types/notice/notice.input';
import { useRouter } from 'next/router';
import { T } from '../../../libs/types/common';

const AddNotice = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [insertNoticeData, setInsertNoticeData] = useState<NoticeInput>(initialValues);
	const [noticeType, setNoticeType] = useState<NoticeType[]>(Object.values(NoticeType));
	const [noticeStatus, setNoticeStatus] = useState<NoticeStatus[]>(Object.values(NoticeStatus));
	const [notices, setNotices] = useState<NoticeType[]>([]);
	const [total, setTotal] = useState<number>(0);
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: currentYear - 1999 }, (_, i) => 2000 + i);

	console.log(years);

	/** APOLLO REQUESTS **/
	const [createNotice, { error: createError }] = useMutation(CREATE_NOTICE_BY_ADMIN, {
		onError: (error) => {
			router.push('/_error');
		},
	});
	const [updateNotice, { error: createUpdateError }] = useMutation(UPDATE_NOTICE_BY_ADMIN, {
		onError: (error) => {
			router.push('/_error');
		},
	});

	const {
		loading: getNoticeLoading,
		data: getNoticeData,
		error: getNoticeError,
		refetch: getNoticeRefetch,
	} = useQuery(GET_NOTICE, {
		fetchPolicy: 'network-only',
		variables: { input: router.query.noticeId },
		onCompleted: (data: T) => {
			setNotices(data?.getNotices?.list || []);
			setTotal(data?.getNotices?.metaCounter[0]?.total || 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		setInsertNoticeData({
			...insertNoticeData,
			noticeContent: getNoticeData?.getNotice ? getNoticeData?.getNotice?.noticeContent : '',
			noticeType: getNoticeData?.getNotice ? getNoticeData?.getNotice?.noticeType : '',
			noticeStatus: getNoticeData?.getNotice ? getNoticeData?.getNotice?.noticeStatus : '',
		});
	}, [getNoticeLoading, getNoticeData]);

	console.log(getNoticeData?.getNotice, ' *****************');

	/** HANDLERS **/

	const doDisabledCheck = () => {
		if (
			// @ts-ignore
			insertNoticeData.noticeContent === '' || // @ts-ignore
			// @ts-ignore
			insertNoticeData.noticeAnswer === '' ||
			// @ts-ignore
			insertNoticeData.noticeType === '' ||
			// @ts-ignore
			insertNoticeData.noticeStatus === '' // @ts-ignore
		) {
			return true;
		}
	};

	const cancelBtnHandler = async () => {
		try {
			await router.push({
				pathname: '/_admin/cs/notice',
				// query: {
				// 	category: 'Motorcycle',
				// },
			});
		} catch (error) {
			sweetErrorHandling(error).then();
		}
	};

	const insertNoticeHandler = useCallback(async () => {
		try {
			const result = await createNotice({
				variables: {
					input: insertNoticeData,
				},
			});

			await sweetMixinSuccessAlert('This question has been created successfully');
			await router.push({
				pathname: '/_admin/cs/notice',
				// query: {
				// 	category: 'Motorcycle',
				// },
			});
		} catch (error) {
			sweetErrorHandling(error).then();
		}
	}, [insertNoticeData]);

	const updateNoticeHandler = useCallback(async () => {
		try {
			// @ts-ignore
			insertNoticeData._id = getNoticeData?.getNotice?._id;
			const result = await updateNotice({
				variables: {
					input: insertNoticeData,
				},
			});

			await sweetMixinSuccessAlert('This FAQ has been updated succeddfully.');
			await router.push({
				pathname: '/_admin',
				query: {
					category: 'Motorcycle',
				},
			});
		} catch (error) {
			sweetErrorHandling(error).then();
		}
	}, [insertNoticeData]);

	// if (user?.memberType !== 'ADMIN') {
	// 	router.push('mypage')
	// }

	console.log('+insertNoticeData', insertNoticeData);

	if (device === 'mobile') {
		return <div>ADD NEW NOTICE PAGE</div>;
	} else {
		return (
			<div className="add-question-page">
				<Stack className="main-title-box">
					<Typography className="main-title">Add New Notice</Typography>
				</Stack>

				<div>
					<Stack className="config">
						<Stack className="description-box">
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Notice Content</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'notice'}
										value={insertNoticeData.noticeContent}
										onChange={({ target: { value } }) =>
											setInsertNoticeData({ ...insertNoticeData, noticeContent: value })
										}
									/>
								</Stack>
							</Stack>
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Select Type</Typography>
									<select
										className={'select-description'}
										defaultValue={insertNoticeData.noticeType || 'select'}
										value={insertNoticeData.noticeType || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertNoticeData({ ...insertNoticeData, noticeType: value.toUpperCase() })
										}
									>
										<>
											<option selected={true} disabled={true} value={'select'}>
												Select
											</option>
											{noticeType.map((type: any) => (
												<option value={`${type}`} key={type}>
													{type}
												</option>
											))}
										</>
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">Select Status</Typography>
									<select
										className={'select-description'}
										defaultValue={insertNoticeData.noticeStatus || 'select'}
										value={insertNoticeData.noticeStatus || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertNoticeData({ ...insertNoticeData, noticeStatus: value.toUpperCase() })
										}
									>
										<>
											<option selected={true} disabled={true} value={'select'}>
												Select
											</option>
											{noticeStatus.map((location: any) => (
												<option value={`${location}`} key={location}>
													{location}
												</option>
											))}
										</>
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>
						</Stack>

						<Stack className="buttons-row">
							<Button className="next-button" onClick={cancelBtnHandler}>
								<Typography className="next-button-text">Cancel</Typography>
							</Button>
							<Box component={'div'}>
								{router.query.noticeId ? (
									<Button className="next-button" disabled={doDisabledCheck()} onClick={updateNoticeHandler}>
										<Typography className="next-button-text">Save</Typography>
									</Button>
								) : (
									<Button className="next-button" disabled={doDisabledCheck()} onClick={insertNoticeHandler}>
										<Typography className="next-button-text">Save</Typography>
									</Button>
								)}
							</Box>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

AddNotice.defaultProps = {
	initialValues: {
		noticeContent: '',
		noticeType: '',
		noticeStatus: '',
	},
};

export default AddNotice;
