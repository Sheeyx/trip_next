import React from 'react';
import { REACT_APP_API_URL } from '../../config';
import { Divider, IconButton, Stack, Typography } from '@mui/material';
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import Link from 'next/link';


const PropertyCard: React.FC<any> = (props : any) => {
  const { property, likePropertyHandler, myFavorites, recentlyVisited } = props;
  const user = useReactiveVar(userVar);

  console.log(property);
  const imagePath: string = property?.propertyImages[0]
    ? `${REACT_APP_API_URL}/${property?.propertyImages[0]}`
    : '/img/banner/header1.svg';
  const memberImgPath = property?.memberData?.memberImage ? `${REACT_APP_API_URL}/${property?.memberData?.memberImage}`
    : '/img/banner/header1.svg';

	const handleLikeClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		likePropertyHandler(user, property?._id);
	  };

  return (
    <Link 
      className="property-card" 
      href={{
        pathname: '/stays/detail',
        query: { id: property?._id },
      }}
    >
      <div className='property-section'>
        <div className='property-img'>
          <img src={imagePath} alt={property.id} />
          <div className='member-img'>
            <img src={memberImgPath} alt="" />
          </div>
          <div className='likes'>
            <IconButton color={'default'} onClick={handleLikeClick}>
              {myFavorites ? (
                <FavoriteIcon color="primary" />
              ) : property?.meLiked && property?.meLiked[0]?.myFavorite ? (
                <FavoriteIcon color="primary" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
          </div>
          <div className='views'>
            <IconButton color={'default'}>
              <RemoveRedEyeRoundedIcon />
            </IconButton>
            <Typography className="view-cnt">{property?.propertyLikes}</Typography>
          </div>
        </div>
        <div className="property-info">
          <h3>{property.propertyTitle}</h3>
          <p className='location'>{property.propertyLocation}</p>
          <Stack className="option">
            <Stack className="option">
              <img src="/img/icons/bed.svg" alt="" /> 
              <span>{property.propertyBeds} bed</span>
            </Stack>
            <Stack className="option">
              <img src="/img/icons/room.svg" alt="" /> 
              <span>{property.propertyRooms} room</span>
            </Stack>
            <Stack className="option">
              <img src="/img/icons/expand.svg" alt="" /> 
              <span>{property.propertySquare} m2</span>
            </Stack>
          </Stack>
          <Divider className='divider' sx={{mt: 2, mb: 2}} />
          <p>Rating: {property.propertyRank}</p>
          <p className='price'>From: <span>${property.propertyPrice}</span> /night</p>
        </div>
		<div className='member-info'>
			<div className='member-img'>
				<img src={memberImgPath} alt=''/>
				<div className='member-data'>
					<p className='member-nick'>{property?.memberData?.memberNick}</p>
					<p className='member-type'>{property?.memberData?.memberType}</p>
					<p className='member-phone'>{property?.memberData?.memberPhone}</p>
				</div>
				
			</div>
			<div className='btn'>
				View Detail
			</div>
		</div>
      </div>
    </Link>
  );
};

export default PropertyCard;
