import printBlock from '@splash-cli/print-block';
import chalk from 'chalk';
import { prompt } from 'inquirer';
import { config, unsplash } from '../extra/config';
import User from './utils/User';
import { authenticatedRequest, updateMe, errorHandler } from '../extra/utils';

export default async function userCommand([cmd]) {
	try {
		if (cmd) cmd = cmd.toString().toLowerCase();

		switch (cmd) {
		case 'login':
			await User.auth.login();
			break;
		case 'logout':
			const success = User.auth.logout();

			if (!success) return console.log(chalk `{bold {red Aborted}}`);

			printBlock(chalk`User data {bold deleted} successfully.`);
			break;
		case 'update':
		case 'edit':
			if (!config.has('user') || !config.get('user').token) return printBlock(chalk `Please log in.`);
			
			const { profile: user } = config.get('user') || {};
			
			const data = await prompt([{
				name: 'username',
				message: 'Username',
				default: user.username,
			}, {
				name: 'firstName',
				message: 'First Name:',
				default: user.first_name,
			}, {
				name: 'lastName',
				message: 'Last Name',
				default: user.last_name
			}, {
				name: 'bio',
				message: 'Bio',
				default: user.bio
			}, {
				name: 'instagramUsername',
				message: 'Instagram Username',
				default: user.instagram_username
			}, {
				name: 'location',
				message: 'Location',
				default: user.location
			}, {
				name: 'url',
				message: 'Url',
				default: user.url
			}]);

			const newUser = await User.update(data);

			if ( newUser.error || newUser.errors ) return printBlock(newUser.error || newUser.errors);

			userCommand([ 'get' ]);
			break;
		case 'likes':
		case 'get-likes':
		case 'liked':
			if (!config.has('user') || !config.get('user').token) return printBlock(chalk `Please log in.`);
			const likes = await User.getLikes();

			printBlock(chalk`{bold {black {bgYellow Last 10 liked photos:}}}`);

			likes.forEach(photo => {
				console.log(chalk`{bold {yellow ID:}} ${photo.id}`);
				console.log(chalk`{bold {yellow Author:}} {cyan @${photo.user.username}}`);
				console.log(chalk`{bold {yellow Link:}} {underline ${photo.html}}`);
				console.log(chalk`{dim -}`.repeat(10));
				console.log();
			});

			break;
		case 'get':
			if ( !config.has('user') || !config.get('user').token ) return printBlock(chalk`Please log in.`);

			printBlock(await User.get());

			break;
		case 'help':
		case 'how':
		case 'h':
			printBlock(chalk`
				{bold {black {bgWhite COMMANDS}}}   	{bold {black {bgYellow ALIASES}}} 		{bold {black {bgWhite DESCRIPTION}}}

				{cyan {bold login}}		{dim none}			  {dim LOGIN WITH UNSPLASH}
				{cyan {bold logout}}	{dim none}			  {dim LOGOUT}
				{cyan {bold liked}} 	{yellow "likes"} or {yellow "get-likes"}	  {dim GET LAST 10 LIKED PHOTOS}
				{cyan {bold get}}		{dim none}			  {dim GET CURRENT USER INFOS}
				{cyan {bold edit}} 		{yellow "update"}		  {dim EDIT USER}
				{cyan {bold help}} 		{yellow "how"}			  {dim SHOWS THIS MESSAGE}
			`.split('\n').map(item => `  ${item.trim()}`).join('\n'));
			break;
		default:
			printBlock(
				chalk`{yellow Sorry!} Option: {yellow "${cmd}"} currently {underline {red not available}}.`, 
				'', 
				chalk`Type "{yellow user {bold help}}" for more infos`
			);
			break;
		}
	} catch (error) {
		errorHandler(error);
	}
}