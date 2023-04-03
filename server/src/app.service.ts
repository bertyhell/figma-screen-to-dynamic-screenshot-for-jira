import { Injectable } from '@nestjs/common';
import fetch, { Headers } from 'node-fetch';

interface FigmaResponse {
	err: any | null;
	images: Record<string, string>;
}

@Injectable()
export class AppService {
	async fetchThumbnailUrl(fileKey, nodeId, token): Promise<string> {
		const myHeaders = new Headers();
		myHeaders.append("X-Figma-Token", token);

		const requestOptions = {
			method: 'GET',
			headers: myHeaders,
			redirect: 'follow' as RequestRedirect
		};

		const response = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}`, requestOptions);
		const jsonResponse = (await response.json()) as FigmaResponse;
		if (jsonResponse.err) {
			throw new Error('Failed to fetch thumbnail from the figma api: ' + JSON.stringify(jsonResponse.err));
		}

		return jsonResponse.images[Object.keys(jsonResponse.images)[0]];
	}
}
