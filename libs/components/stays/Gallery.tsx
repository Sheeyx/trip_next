import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import 'swiper/swiper-bundle.min.css';
import 'swiper/swiper.min.css';
import GridViewIcon from '@mui/icons-material/GridView';
import { REACT_APP_API_URL } from '../../config';
import { Theme } from '@mui/material/styles';

const images = [
  '/img/pro1.jpg',
  '/img/pro2.jpg',
  '/img/pro3.jpg',
  '/img/pro4.jpg',
  '/img/pro5.jpg',
];

const Gallery: any = ({images} : any) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isViewAll, setIsViewAll] = useState(false);

  console.log(images);
  
  const openModal = (image: string | null, viewAll: boolean) => {
    setCurrentImage(image);
    setModalIsOpen(true);
    setIsViewAll(viewAll);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentImage(null);
    setIsViewAll(false);
  };

  return (
    <div className="gallery-container">
      <div className={`gallery-grid ${images?.length === 4 ? 'grid-4' : ''}`}>
        {images?.map((image:any, index:any) => (
          <div key={index} className="gallery-item" onClick={() => openModal(image, false)}>
            <img src={`${REACT_APP_API_URL}/${image}`} alt={`Gallery ${index + 1}`} />
          </div>
        ))}
        <div className="gallery-item view-all" onClick={() => openModal(null, true)}>
          <button className="view-all-button"> <GridViewIcon/> All Photos</button>
        </div>
      </div>
      <Dialog
        open={modalIsOpen}
        onClose={closeModal}
        aria-labelledby="responsive-dialog-title"
        maxWidth="lg"
        fullWidth
      >
        <DialogContent dividers>
          <IconButton
            aria-label="close"
            onClick={closeModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme: Theme) => theme.palette.grey[500], // Type for theme is specified here
            }}
          >
            <CloseIcon />
          </IconButton>
          {isViewAll ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
            >
              {images?.map((image:any, index:any) => (
                <SwiperSlide key={index}>
                  <img src={`${REACT_APP_API_URL}/${image}`} alt={`Slide ${index + 1}`} className="modal-image" />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            currentImage && <img src={`${REACT_APP_API_URL}/${currentImage}`} alt="Current" className="modal-image" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
