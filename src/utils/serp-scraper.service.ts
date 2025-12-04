import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SerpScraperService {
  private readonly apiKey = process.env.SERP_API_KEY;

  async scrapeImages(query: string, limit = 5): Promise<string[]> {
    const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=isch&api_key=${this.apiKey}`;

    const response = await axios.get(apiUrl);
    const images = response.data?.images_results || [];

    return images.slice(0, limit).map((img: any) => img.original);
  }
}
