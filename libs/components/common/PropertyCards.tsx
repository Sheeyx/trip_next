import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface PropertyBigCardProps {
	property?: Property;
	likePropertyHandler?: any;
}

const PropertyCard = (props: PropertyBigCardProps) => {
	const { property, likePropertyHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
    console.log(property);
    

	/** HANDLERS **/
	const goPropertyDetatilPage = (propertyId: string) => {
		router.push(`/property/detail?id=${propertyId}`);
	};

	if (device === 'mobile') {
		return <div>APARTMEND BIG CARD</div>;
	} else {
		return (
			<Stack className='profile-property'>
                <img src={`${REACT_APP_API_URL}/${property?.propertyImages[0]}`} alt="" />
                <div className='inner-card'>
                    <div className='like'>
                        <FavoriteIcon/>
                        <span>{property?.propertyLikes}</span>
                    </div>
                    <div className='views'>
                        <VisibilityIcon/>
                        <span>{property?.propertyViews}</span>
                    </div>
                    <p>{property?.propertyTitle}</p>
                </div>
            </Stack>
		);
	}
};

export default PropertyCard;