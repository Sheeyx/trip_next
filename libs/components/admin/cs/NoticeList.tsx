import React from 'react';
import Link from 'next/link';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Button,
	Menu,
	Fade,
	MenuItem,
} from '@mui/material';
import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { NoticeStatus } from '../../../enums/notice.enum';
import { Notices } from '../../../types/notice/notice';

interface Data {
	id: string;
	Content: string;
	memberNick: string;
	agent: string;
	location: string;
	type: string;
	status: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'type',
		numeric: false,
		disablePadding: false,
		label: 'TYPE',
	},
	{
		id: 'Content',
		numeric: true,
		disablePadding: false,
		label: 'CONTENT',
	},
	// {
	// 	id: 'memberNick',
	// 	numeric: false,
	// 	disablePadding: false,
	// 	label: 'MEMBER NICK',
	// },
	{
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'STATUS',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, notice: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { onSelectAllClick } = props;

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell key={headCell.id} align={'center'} padding={headCell.disablePadding ? 'none' : 'normal'}>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface NoticePanelListType {
	notices: Notices[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateNoticeHandler: any;
	removeNoticeHandler: any;
}

export const NoticeArticlesPanelList = (props: NoticePanelListType) => {
	const { notices, anchorEl, menuIconClickHandler, menuIconCloseHandler, updateNoticeHandler, removeNoticeHandler } =
		props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead />
					<TableBody>
						{notices.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={8}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{notices.length !== 0 &&
							notices.map((notice: any, index: number) => {
								return (
									<TableRow hover key={notice?._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell align="center">{notice.noticeType}</TableCell>
										<TableCell align="center">
											<Link href={`/_admin/cs/notice_create?noticeId=${notice._id}`}>{notice.noticeContent}</Link>
										</TableCell>
										{/* <TableCell align="center">{notice.memberData?.memberNick}</TableCell> */}
										<TableCell align="center">
											<Button onClick={(e: any) => menuIconClickHandler(e, notice._id)} className={'badge success'}>
												{notice.noticeStatus}
											</Button>

											<Menu
												className={'menu-modal'}
												MenuListProps={{
													'aria-labelledby': 'fade-button',
												}}
												anchorEl={anchorEl[notice._id]}
												open={Boolean(anchorEl[notice._id])}
												onClose={menuIconCloseHandler}
												TransitionComponent={Fade}
												sx={{ p: 1 }}
											>
												{Object.values(NoticeStatus)
													.filter((ele: string) => ele !== notice?.noticeStatus)
													.map((status: string) => (
														<MenuItem
															onClick={() => updateNoticeHandler({ _id: notice._id, noticeStatus: status })}
															key={status}
														>
															<Typography variant={'subtitle1'} component={'span'}>
																{status}
															</Typography>
														</MenuItem>
													))}
											</Menu>
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
