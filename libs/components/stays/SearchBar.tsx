import React, { useCallback, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { PropertiesInquiry } from '../../types/property/property.input';
import router from 'next/router';

interface FilterType {
	searchFilter: PropertiesInquiry;
	setSearchFilter: any;
	initialInput: PropertiesInquiry;
}

const SearchBar = (props: FilterType) => {
    const [startDate, setStartDate] = useState<Date | any>(null);
    const [endDate, setEndDate] = useState<Date | any>(null);
    const [location, setLocation] = useState<string>('');
    const [roomPeople, setRoomPeople] = useState<string>('');
    const { searchFilter, setSearchFilter, initialInput } = props;

    const handleSearch = useCallback(async () => {
        try {
            const [rooms, people] = roomPeople.split('·').map(item => item.trim());
            
            // Prepare new search filter
            let newSearchFilter = {
                ...searchFilter,
                search: {
                    ...(location ? { locationList: [location] } : {}),
                    ...(rooms ? { roomsList: [Number(rooms)] } : {}),
                }
            };

            // If all fields are empty, remove filters to show everything
            

            // Update the search filter in state
            setSearchFilter(newSearchFilter);

            // Perform search
            await router.push(
                `/stays?input=${JSON.stringify(newSearchFilter)}`
            );

            console.log('handleSearch:', newSearchFilter);
        } catch (err: any) {
            console.log('ERROR in handleSearch:', err);
        }
    }, [location, roomPeople, startDate, endDate, searchFilter]);

    const propertyLocationSelectHandler = useCallback(
        async (e: any) => {
            try {
                const isChecked = e.target.checked;
                const value = e.target.value;
                if (isChecked) {
                    await router.push(
                        `/stays?input=${JSON.stringify({
                            ...searchFilter,
                            search: { ...searchFilter.search, locationList: [...(searchFilter?.search?.locationList || []), value] },
                        })}`
                    );
                } else if (searchFilter?.search?.locationList?.includes(value)) {
                    await router.push(
                        `/stays?input=${JSON.stringify({
                            ...searchFilter,
                            search: {
                                ...searchFilter.search,
                                locationList: searchFilter?.search?.locationList?.filter((item: string) => item !== value),
                            },
                        })}`
                    );
                }

                if (searchFilter?.search?.typeList?.length == 0) {
                    alert('error');
                }

                console.log('propertyLocationSelectHandler:', e.target.value);
            } catch (err: any) {
                console.log('ERROR, propertyLocationSelectHandler:', err);
            }
        },
        [searchFilter],
    );

    const propertyRoomSelectHandler = useCallback(
        async (number: Number) => {
            try {
                if (number != 0) {
                    if (searchFilter?.search?.roomsList?.includes(number)) {
                        await router.push(
                            `/stays?input=${JSON.stringify({
                                ...searchFilter,
                                search: {
                                    ...searchFilter.search,
                                    roomsList: searchFilter?.search?.roomsList?.filter((item: Number) => item !== number),
                                },
                            })}`
                        );
                    } else {
                        await router.push(
                            `/stays?input=${JSON.stringify({
                                ...searchFilter,
                                search: { ...searchFilter.search, roomsList: [...(searchFilter?.search?.roomsList || []), number] },
                            })}`
                        );
                    }
                } else {
                    delete searchFilter?.search.roomsList;
                    setSearchFilter({ ...searchFilter });
                    await router.push(
                        `/stays?input=${JSON.stringify({
                            ...searchFilter,
                            search: {
                                ...searchFilter.search,
                            },
                        })}`
                    );
                }

                console.log('propertyRoomSelectHandler:', number);
            } catch (err: any) {
                console.log('ERROR, propertyRoomSelectHandler:', err);
            }
        },
        [searchFilter],
    );

    return (
        <div className="search-bar">
            <div className="input-group">
                <FaMapMarkerAlt />
                <input 
                    type="text" 
                    placeholder="Where are you going ?" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </div>
            <div className="input-group">
                <FaCalendarAlt />
                <DatePicker 
                    selected={startDate}
                    onChange={(dates: [Date | null, Date | null]) => {
                        const [start, end] = dates;
                        setStartDate(start);
                        setEndDate(end);
                    }} 
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    placeholderText="From when - To when"
                />
            </div>
            <div className="input-group">
                <FaUser />
                <input 
                    type="text" 
                    placeholder="Room · People" 
                    value={roomPeople}
                    onChange={(e) => setRoomPeople(e.target.value)}
                />
            </div>
            <button className="search-button" onClick={handleSearch}>
                Search
            </button>
        </div>
    );
};

export default SearchBar;
