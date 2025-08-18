import { 
  PopularRequest, 
  OccasionRequest, 
  PersonalizedRequest, 
  RecommendResponse 
} from '../types/recommendation';

const API_BASE = '/api/recommend';

export class RecommendationAPI {
  // 热门礼物推荐
  static async getPopularRecommendations(request: PopularRequest): Promise<RecommendResponse> {
    try {
      const response = await fetch(`${API_BASE}/popular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get popular recommendations:', error);
      throw error;
    }
  }

  // 节日礼物推荐
  static async getOccasionRecommendations(request: OccasionRequest): Promise<RecommendResponse> {
    try {
      const response = await fetch(`${API_BASE}/occasion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get occasion recommendations:', error);
      throw error;
    }
  }

  // 个性化礼物推荐
  static async getPersonalizedRecommendations(request: PersonalizedRequest): Promise<RecommendResponse> {
    try {
      const response = await fetch(`${API_BASE}/personalized`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      throw error;
    }
  }

  // GET方法的热门推荐
  static async getPopularRecommendationsGET(params: {
    limit?: number;
    region?: string;
    budget?: string[];
  }): Promise<RecommendResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.region) searchParams.append('region', params.region);
      if (params.budget) searchParams.append('budget', params.budget.join(','));

      const response = await fetch(`${API_BASE}/popular?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get popular recommendations (GET):', error);
      throw error;
    }
  }

  // GET方法的节日推荐
  static async getOccasionRecommendationsGET(params: {
    occasion: string;
    limit?: number;
    region?: string;
    budget?: string[];
  }): Promise<RecommendResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('occasion', params.occasion);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.region) searchParams.append('region', params.region);
      if (params.budget) searchParams.append('budget', params.budget.join(','));

      const response = await fetch(`${API_BASE}/occasion?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get occasion recommendations (GET):', error);
      throw error;
    }
  }

  // GET方法的个性化推荐
  static async getPersonalizedRecommendationsGET(params: {
    relationship: string;
    gender?: string;
    age?: number;
    interests?: string[];
    budget?: string[];
    otherRequirements?: string[];
    limit?: number;
    region?: string;
  }): Promise<RecommendResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('relationship', params.relationship);
      if (params.gender) searchParams.append('gender', params.gender);
      if (params.age) searchParams.append('age', params.age.toString());
      if (params.interests) searchParams.append('interests', params.interests.join(','));
      if (params.budget) searchParams.append('budget', params.budget.join(','));
      if (params.otherRequirements) searchParams.append('other_requirements', params.otherRequirements.join(','));
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.region) searchParams.append('region', params.region);

      const response = await fetch(`${API_BASE}/personalized?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get personalized recommendations (GET):', error);
      throw error;
    }
  }
}

export default RecommendationAPI;

