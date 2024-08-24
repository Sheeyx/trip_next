import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_NOTIFICATION, GET_WAIT_NOTIFICATION_COUNT } from '../../../apollo/user/query';
import { UPDATE_NOTIFICATION } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { REACT_APP_API_URL } from '../../config';

const NotificationCard = ({ notice, setWaitData }: any) => {
  const device = useDeviceDetect();
  const user = useReactiveVar(userVar);
  const [notification, setNotification] = useState<any[]>([]);

  // Query to get notifications
  const { loading, data, refetch, error } = useQuery(GET_NOTIFICATION, {
    fetchPolicy: 'network-only',
    variables: { notificationId: user?._id },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setNotification(data?.getNotification || []);
    },
    onError: (err) => {
      console.error('Error fetching notifications:', err);
    }
  });

  // Query to get waiting notification count
  const { loading: waitLoading, data: waitData, refetch: refetchWaitCount, error: waitError } = useQuery(GET_WAIT_NOTIFICATION_COUNT, {
    variables: { notificationId: user?._id },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setWaitData(data?.getWaitNotificationCount);
    },
    onError: (err) => {
      console.error('Error fetching waiting notifications:', err);
    }
  });

  // Mutation to update notification status
  const [updateNotification] = useMutation(UPDATE_NOTIFICATION, {
    onCompleted: async () => {
      console.log('Mutation completed successfully');
      await refetch(); // Refetch the notification query to get updated data
      await refetchWaitCount(); // Refetch the wait count query
    },
    onError: (err) => {
      console.error('Error updating notification status:', err);
    }
  });

  // Handle notification read
  const handleSubmit = async (id: string) => {
    try {
      await updateNotification({
        variables: {
          input: {
            _id: id,
            notificationStatus: 'READ',
          },
        },
      });
    } catch (err) {
      console.error('Error in handleSubmit:', err);
    }
  };

  // Mobile View: Show a simple message for now
  if (device === 'mobile') {
    return <div>Notification CARD</div>;
  }

  // Desktop View: Display notification card
  if (!notice || loading || waitLoading || error || waitError) {
    return null; // No data or loading state, render nothing
  }

  // Only render notifications if there is data
  return (
    <div className={`notification-card ${notice ? 'show' : 'hide'}`}>
      <h2>Notifications</h2>
      {notification.length > 0 ? (
        [...notification]
          .sort((a, b) => {
            // Sort by notification status first
            if (a.notificationStatus === 'WAIT' && b.notificationStatus !== 'WAIT') return -1;
            if (a.notificationStatus !== 'WAIT' && b.notificationStatus === 'WAIT') return 1;
            if (a.notificationStatus === 'READ' && b.notificationStatus !== 'READ') return -1;
            if (a.notificationStatus !== 'READ' && b.notificationStatus === 'READ') return 1;
            // If statuses are the same, sort by updatedAt in descending order
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          })
          .map((value) => (
            <div
              key={value._id}
              className={`card ${value.notificationStatus === 'READ' ? 'read' : 'unread'}`}
              onClick={() => handleSubmit(value._id)}
            >
              {value.notificationStatus === 'WAIT' && <div className="dot"></div>}
              <p className="title">{value.notificationTitle}</p>
              <div className="info">
                <img src={`${REACT_APP_API_URL}/${value?.memberData?.memberImage}`} alt="Notification Member" />
                <p>{value.notificationDesc}</p>
              </div>
            </div>
          ))
      ) : (
        <p className='notification-available'>No notifications available.</p>
      )}
    </div>
  );
};

export default NotificationCard;
