import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { Messages, REACT_APP_API_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { GET_AGENT_PROPERTIES, GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { Follower, Following } from '../../types/follow/follow';
import { T } from '../../types/common';
import Link from 'next/link';
import PropertyCard from '../common/PropertyCards';
import { Property } from '../../types/property/property';
import { AgentPropertiesInquiry } from '../../types/property/property.input';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';


const MyProfile: NextPage = ({ initialInputs, initialFollowerInput, initialInput, initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);
	const [agentProperties, setAgentProperties] = useState<Property[]>([]);
	const [searchFilter, setSearchFilter] = useState<AgentPropertiesInquiry>(initialInput);
	const [total, setTotal] = useState<number>(0);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInputs);
	const [totalFollowings, setTotalFollowings] = useState<number>(0);
	const [followerInquiry, setFollowerInquiry] = useState<FollowInquiry>(initialFollowerInput);
	const [totalFollower, setTotalFollower] = useState<number>(0);
	const router = useRouter();
	
	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);
	
	const {
		loading: getAgentPropertiesLoading,
		data: getAgentPropertiesData,
		error: getAgentPropertiesError,
		refetch: getAgentPropertiesRefetch,
	} = useQuery(GET_AGENT_PROPERTIES, {
		fetchPolicy: 'network-only', // by default cache-first
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProperties(data?.getAgentProperties?.list);
			setTotal(data?.getAgentProperties?.metaCounter[0]?.total ?? 0);
		},
	});

	const {
		loading: getMemberFollowingsLoading,
		data: getMemberFollowingsData,
		error: getMemberFollowingsError,
		refetch: getMemberFollowingsRefetch,
	} = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only', // by default cache-first
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followerId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTotalFollowings(data?.getMemberFollowings?.metaCounter[0]?.total);
		},
	});

	const {
		loading: getMemberFollowersLoading,
		data: getMemberFollowersData,
		error: getMemberFollowersError,
		refetch: getMemberFollowersRefetch,
	} = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followerInquiry },
		skip: !followerInquiry?.search?.followingId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTotalFollower(data?.getMemberFollowers?.metaCounter[0]?.total);
		},
	});



	/** LIFECYCLES **/
	useEffect(() => {
		setUpdateData({
			...updateData,
			memberNick: user.memberNick,
			memberPhone: user.memberPhone,
			memberAddress: user.memberAddress,
			memberImage: user.memberImage,
			memberProperties: user.memberProperties,
		});
	}, [user]);

	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followerId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followerId: user?._id } });
	}, []);

	useEffect(() => {
		if (router.query.memberId)
		setFollowerInquiry({ ...followerInquiry, search: { followingId: router.query.memberId as string } });
		else setFollowerInquiry({ ...followerInquiry, search: { followingId: user?._id } });
	}, []);


	const handleSettingsClick = () => {
	  router.push('/mypage?category=mySettings');
	};

	/** HANDLERS **/
	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0];
			console.log('+image:', image);

			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'member',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			console.log('+responseImage: ', responseImage);
			updateData.memberImage = responseImage;
			setUpdateData({ ...updateData });

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	const updatePropertyHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			updateData._id = user._id;
			const result = await updateMember({
				variables: {
					input: updateData,
				},
			});

			// @ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(result.data.updateMember?.accessToken);
			await sweetMixinSuccessAlert('information updated successfully.');
		} catch (error) {
			sweetErrorHandling(error).then();
		}
	}, [updateData]);

	const doDisabledCheck = () => {
		if (
			updateData.memberNick === '' ||
			updateData.memberPhone === '' ||
			updateData.memberAddress === '' ||
			updateData.memberImage === ''
		) {
			return true;
		}
	};

	console.log('+updateData', updateData);

	if (device === 'mobile') {
		return <>MY PROFILE PAGE MOBILE</>;
	} else
		return (
			<div id="my-profile-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Profile</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="top-box">
					<Stack className='upper-box'>
						<Stack className="profile-photo">
						<img
										src={
											updateData?.memberImage
												? `${REACT_APP_API_URL}/${updateData?.memberImage}`
												: `/img/profile/defaultUser.svg`
										}
										alt=""
									/>									
						</Stack>
						<Stack>
							<Typography className="title">{updateData?.memberNick}</Typography>
						<Stack>
						<Stack>
							<Stack className='info-links'>
										<Link className='properties' href={{
													pathname: '/mypage',
													query: { category: 'myProperties' },
												}}
												scroll={false}>
											<p className='num'>{total}</p>
											<p>Properties</p>
										</Link>
										<Link className='followers' href={{
											pathname: '/mypage',
											query: { category: 'followers' },
										}}
										scroll={false}>
											<p className='num'>{totalFollower}</p>
											<p>Followers</p>
										</Link>
										<Link className='following' href={{
											pathname: '/mypage',
											query: { category: 'followings' },
										}}
										scroll={false}>
											<p className='num'>{totalFollowings}</p>
											<p>Following</p>
										</Link>
							</Stack>
							<Stack className='member-info'>
								<Typography> {user?.memberFullName}</Typography>
								<Typography className='member-phone'><PhoneInTalkIcon/> {user?.memberPhone}</Typography>
								<Typography className='member-type'> {user?.memberType}</Typography>
							</Stack>
						</Stack>
						
					</Stack>
						
					</Stack>
					<Stack>
						<SettingsIcon sx={{color: "#3a71fe", cursor: "pointer"}} onClick = {handleSettingsClick} />
					</Stack>
					</Stack>
					<Stack className='property-card'>
						{
							agentProperties?.map((value,index)=>{
								return (
									<PropertyCard property={value}/>	
								)
							})
						}
					</Stack>
						
							
				</Stack>
			</div>
		);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
	},
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			propertyStatus: 'ACTIVE',
		},
	},

	initialInputs: {
		page: 1,
		limit: 5,
		search: {
			followerId: '',
		},
	},

	initialFollowerInput: {
		page: 1,
		limit: 5,
		search: {
			followingId: '',
		},
	},
	
};


export default MyProfile;