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
import { Faqs } from '../../../types/faq/faq';
import { FaqStatus } from '../../../enums/faq.enum';

interface Data {
	id: string;
	question: string;
	answer: string;
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
		id: 'question',
		numeric: true,
		disablePadding: false,
		label: 'QUESTION',
	},
	{
		id: 'answer',
		numeric: false,
		disablePadding: false,
		label: 'ANSWER',
	},
	{
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'STATUS',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, faq: keyof Data) => void;
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

interface FaqPanelListType {
	faqs: Faqs[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateFaqHandler: any;
	removeFaqHandler: any;
}

export const FaqArticlesPanelList = (props: FaqPanelListType) => {
	const { faqs, anchorEl, menuIconClickHandler, menuIconCloseHandler, updateFaqHandler, removeFaqHandler } = props;
	console.log(faqs, 'FAQS');

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead />
					<TableBody>
						{faqs.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={8}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{faqs.length !== 0 &&
							faqs.map((faq: any, index: number) => {
								return (
									<TableRow hover key={faq?._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell align="center">{faq.faqType}</TableCell>
										<TableCell align="center">{faq.faqQuestion}</TableCell>
										<TableCell align="center">{faq.faqAnswer}</TableCell>
										<TableCell align="center">
											<Button onClick={(e: any) => menuIconClickHandler(e, faq._id)} className={'badge success'}>
												{faq.faqStatus}
											</Button>

											<Menu
												className={'menu-modal'}
												MenuListProps={{
													'aria-labelledby': 'fade-button',
												}}
												anchorEl={anchorEl[faq._id]}
												open={Boolean(anchorEl[faq._id])}
												onClose={menuIconCloseHandler}
												TransitionComponent={Fade}
												sx={{ p: 1 }}
											>
												{Object.values(FaqStatus)
													.filter((ele: string) => ele !== faq?.faqStatus)
													.map((status: string) => (
														<MenuItem
															onClick={() => updateFaqHandler({ _id: faq._id, faqStatus: status })}
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
