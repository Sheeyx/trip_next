import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_FAQ } from '../../../apollo/user/query';
import { getJwtToken } from '../../../libs/auth';
import useDeviceDetect from '../../../libs/hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { FaqStatus, FaqType } from '../../../libs/enums/faq.enum';
import { CREATE_FAQ_BY_ADMIN, UPDATE_FAQ_BY_ADMIN } from '../../../apollo/admin/mutation';
import { FaqInput } from '../../../libs/types/faq/faq.input';
import { useRouter } from 'next/router';

const AddFaq = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [insertFaqData, setInsertFaqData] = useState<FaqInput>(initialValues);
	const [faqType, setFaqType] = useState<FaqType[]>(Object.values(FaqType));
	const [faqStatus, setFaqStatus] = useState<FaqStatus[]>(Object.values(FaqStatus));
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: currentYear - 1999 }, (_, i) => 2000 + i);

	console.log(years);

	/** APOLLO REQUESTS **/
	const [createFaq] = useMutation(CREATE_FAQ_BY_ADMIN);
	const [updateFaq] = useMutation(UPDATE_FAQ_BY_ADMIN);

	const {
		loading: getFaqLoading,
		data: getFaqData,
		error: getFaqError,
		refetch: getFaqRefetch,
	} = useQuery(GET_FAQ, {
		fetchPolicy: 'network-only',
		variables: { input: router.query.faqId },
	});
	/** LIFECYCLES **/
	useEffect(() => {
		setInsertFaqData({
			...insertFaqData,
			faqQuestion: getFaqData?.getFaq ? getFaqData?.getFaq?.faqQuestion : '',
			faqAnswer: getFaqData?.getFaq ? getFaqData?.getFaq?.faqAnswer : '',
			faqType: getFaqData?.getFaq ? getFaqData?.getFaq?.faqType : '',
			faqStatus: getFaqData?.getFaq ? getFaqData?.getFaq?.faqStatus : '',
		});
	}, [getFaqLoading, getFaqData]);

	/** HANDLERS **/

	const doDisabledCheck = () => {
		if (
			// @ts-ignore
			insertFaqData.faqQuestion === '' || // @ts-ignore
			// @ts-ignore
			insertFaqData.faqAnswer === '' ||
			// @ts-ignore
			insertFaqData.faqType === '' ||
			// @ts-ignore
			insertFaqData.faqStatus === '' // @ts-ignore
		) {
			return true;
		}
	};

	const cancelBtnHandler = async () => {
		try {
			await router.push({
				pathname: '/_admin/cs/faq',
				// query: {
				// 	category: 'Motorcycle',
				// },
			});
		} catch (error) {
			sweetErrorHandling(error).then();
		}
	};

	const insertFaqHandler = useCallback(async () => {
		try {
			const result = await createFaq({
				variables: {
					input: insertFaqData,
				},
			});

			await sweetMixinSuccessAlert('This question has been created successfully');
			await router.push({
				pathname: '/_admin/cs/faq',
				// query: {
				// 	category: 'Motorcycle',
				// },
			});
		} catch (error) {
			sweetErrorHandling(error).then();
		}
	}, [insertFaqData]);

	const updateFaqHandler = useCallback(async () => {
		try {
			// @ts-ignore
			insertFaqData._id = getFaqData?.getFaq?._id;
			const result = await updateFaq({
				variables: {
					input: insertFaqData,
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
	}, [insertFaqData]);

	// if (user?.memberType !== 'ADMIN') {
	// 	router.push('mypage')
	// }

	console.log('+insertFaqData', insertFaqData);

	if (device === 'mobile') {
		return <div>ADD NEW QUESTION MOBILE PAGE</div>;
	} else {
		return (
			<div className="add-question-page">
				<Stack className="main-title-box">
					<Typography className="main-title">Add New Frequently Asked Question</Typography>
				</Stack>

				<div>
					<Stack className="config">
						<Stack className="description-box">
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Question</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'question'}
										value={insertFaqData.faqQuestion}
										onChange={({ target: { value } }) => setInsertFaqData({ ...insertFaqData, faqQuestion: value })}
									/>
								</Stack>
							</Stack>
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Answer</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={'question'}
										value={insertFaqData.faqAnswer}
										onChange={({ target: { value } }) => setInsertFaqData({ ...insertFaqData, faqAnswer: value })}
									/>
								</Stack>
							</Stack>
							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">Select Type</Typography>
									<select
										className={'select-description'}
										defaultValue={insertFaqData.faqType || 'select'}
										value={insertFaqData.faqType || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertFaqData({ ...insertFaqData, faqType: value.toUpperCase() })
										}
									>
										<>
											<option selected={true} disabled={true} value={'select'}>
												Select
											</option>
											{faqType.map((type: any) => (
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
										defaultValue={insertFaqData.faqStatus || 'select'}
										value={insertFaqData.faqStatus || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertFaqData({ ...insertFaqData, faqStatus: value.toUpperCase() })
										}
									>
										<>
											<option selected={true} disabled={true} value={'select'}>
												Select
											</option>
											{faqStatus.map((location: any) => (
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
								{router.query.faqId ? (
									<Button className="next-button" disabled={doDisabledCheck()} onClick={updateFaqHandler}>
										<Typography className="next-button-text">Save</Typography>
									</Button>
								) : (
									<Button className="next-button" disabled={doDisabledCheck()} onClick={insertFaqHandler}>
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

AddFaq.defaultProps = {
	initialValues: {
		faqQuestion: '',
		faqAnswer: '',
		faqType: '',
		faqStatus: '',
	},
};

export default AddFaq;
