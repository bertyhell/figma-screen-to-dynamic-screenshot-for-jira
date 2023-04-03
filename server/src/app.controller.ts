import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import { Readable } from 'node:stream';
import fetch from 'node-fetch';

@Controller('/')
export class AppController {
	constructor(private readonly appService: AppService) {
	}

	@Get('/status')
	getStatus() {
		return { status: 'service is up' }
	}

	@Get('/images/:fileKey/:nodeId')
	@Header('Content-Type', 'image/png')
	async getImageForFigmaScreen(@Param('fileKey') fileKey: string, @Param('nodeId') nodeId: string): Promise<StreamableFile> {
		const thumbnailUrl = await this.appService.fetchThumbnailUrl(fileKey, nodeId, process.env.FIGMA_PERSONAL_TOKEN);
		if (!thumbnailUrl) {
			throw new Error('Failed to fetch the image from figma');
		}

		let response = await fetch(thumbnailUrl);

		let readableStream = response.body;

		const readStream: Readable = new Readable().wrap(readableStream);

		return new StreamableFile(readStream);
	}
}
