'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import RecommendationAPI from '@/lib/api/recommendations';
import { RecommendResponse, ResultItem } from '@/lib/types/recommendation';

export default function TestRecommendationsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Popular recommendations
  const [popularLimit, setPopularLimit] = useState(10);
  const [popularRegion, setPopularRegion] = useState('CA/US');
  const [popularBudget, setPopularBudget] = useState<string[]>(['25_50', '50_100']);

  // Occasion recommendations
  const [occasion, setOccasion] = useState('birthday');
  const [occasionLimit, setOccasionLimit] = useState(10);
  const [occasionRegion, setOccasionRegion] = useState('CA/US');
  const [occasionBudget, setOccasionBudget] = useState<string[]>(['25_50', '50_100']);

  // Personalized recommendations
  const [relationship, setRelationship] = useState('friend');
  const [gender, setGender] = useState('unknown');
  const [age, setAge] = useState(30);
  const [interests, setInterests] = useState<string[]>(['tech', 'gaming']);
  const [personalizedBudget, setPersonalizedBudget] = useState<string[]>(['50_100']);
  const [otherRequirements, setOtherRequirements] = useState<string[]>([]);
  const [personalizedLimit, setPersonalizedLimit] = useState(10);
  const [personalizedRegion, setPersonalizedRegion] = useState('CA/US');

  const testPopularRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await RecommendationAPI.getPopularRecommendations({
        limit: popularLimit,
        region: popularRegion,
        budget: popularBudget as any
      });
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testOccasionRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await RecommendationAPI.getOccasionRecommendations({
        occasion,
        limit: occasionLimit,
        region: occasionRegion,
        budget: occasionBudget as any
      });
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testPersonalizedRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await RecommendationAPI.getPersonalizedRecommendations({
        answers: {
          relationship,
          gender: gender as any,
          age,
          interests,
          budget: personalizedBudget as any,
          other_requirements: otherRequirements
        },
        limit: personalizedLimit,
        region: personalizedRegion
      });
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommendation Results</CardTitle>
          <div className="text-sm text-gray-600">
            <p>Total Items: {results.items.length}</p>
            <p>Categories: {Object.entries(results.coverage.categories).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
            <p>Price Range: {results.coverage.price}</p>
            <p>Region: {results.assumptions.region}</p>
            <p>Audit ID: {results.audit_id}</p>
            <p>Updated: {new Date(results.updated_at).toLocaleString()}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.items.map((item: ResultItem) => (
              <Card key={item.rank} className="p-4">
                <div className="flex items-start space-x-4">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600">Category: {item.category}</p>
                    <p className="text-sm text-gray-600">Price: {item.price_band}</p>
                    <p className="text-sm text-gray-600">Badges: {item.badges.join(', ')}</p>
                    <p className="text-sm text-gray-600">Why: {item.why}</p>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Scores:</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <span>Popularity: {item.scores.popularity.toFixed(2)}</span>
                        <span>Quality: {item.scores.quality.toFixed(2)}</span>
                        <span>Giftability: {item.scores.giftability.toFixed(2)}</span>
                        <span>Logistics: {item.scores.logistics.toFixed(2)}</span>
                        <span>Match: {item.scores.match.toFixed(2)}</span>
                        <span>Final: {item.scores.final.toFixed(2)}</span>
                      </div>
                    </div>
                    <a 
                      href={item.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Product
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Recommendation System Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="popular-limit">Limit</Label>
              <Input
                id="popular-limit"
                type="number"
                value={popularLimit}
                onChange={(e) => setPopularLimit(parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>
            <div>
              <Label htmlFor="popular-region">Region</Label>
              <Input
                id="popular-region"
                value={popularRegion}
                onChange={(e) => setPopularRegion(e.target.value)}
              />
            </div>
            <div>
              <Label>Budget</Label>
              <div className="space-y-2">
                {['under_25', '25_50', '50_100', '100_200', '200_500', '500_plus'].map((budget) => (
                  <label key={budget} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={popularBudget.includes(budget)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPopularBudget([...popularBudget, budget]);
                        } else {
                          setPopularBudget(popularBudget.filter(b => b !== budget));
                        }
                      }}
                    />
                    <span className="text-sm">{budget}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button 
              onClick={testPopularRecommendations} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Test Popular'}
            </Button>
          </CardContent>
        </Card>

        {/* Occasion Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Occasion Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="occasion">Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="housewarming">Housewarming</SelectItem>
                  <SelectItem value="baby_shower">Baby Shower</SelectItem>
                  <SelectItem value="christmas">Christmas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="occasion-limit">Limit</Label>
              <Input
                id="occasion-limit"
                type="number"
                value={occasionLimit}
                onChange={(e) => setOccasionLimit(parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>
            <div>
              <Label htmlFor="occasion-region">Region</Label>
              <Input
                id="occasion-region"
                value={occasionRegion}
                onChange={(e) => setOccasionRegion(e.target.value)}
              />
            </div>
            <div>
              <Label>Budget</Label>
              <div className="space-y-2">
                {['under_25', '25_50', '50_100', '100_200', '200_500', '500_plus'].map((budget) => (
                  <label key={budget} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={occasionBudget.includes(budget)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOccasionBudget([...occasionBudget, budget]);
                        } else {
                          setOccasionBudget(occasionBudget.filter(b => b !== budget));
                        }
                      }}
                    />
                    <span className="text-sm">{budget}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button 
              onClick={testOccasionRecommendations} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Test Occasion'}
            </Button>
          </CardContent>
        </Card>

        {/* Personalized Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="relationship">Relationship *</Label>
              <Input
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g., friend, coworker, grandma"
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">Unknown</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="nonbinary">Non-binary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                min="1"
                max="120"
              />
            </div>
            <div>
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input
                id="interests"
                value={interests.join(', ')}
                onChange={(e) => setInterests(e.target.value.split(',').map(s => s.trim()))}
                placeholder="e.g., tech, gaming, cooking"
              />
            </div>
            <div>
              <Label>Budget</Label>
              <div className="space-y-2">
                {['under_25', '25_50', '50_100', '100_200', '200_500', '500_plus'].map((budget) => (
                  <label key={budget} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={personalizedBudget.includes(budget)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPersonalizedBudget([...personalizedBudget, budget]);
                        } else {
                          setPersonalizedBudget(personalizedBudget.filter(b => b !== budget));
                        }
                      }}
                    />
                    <span className="text-sm">{budget}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="other-requirements">Other Requirements (comma-separated)</Label>
              <Input
                id="other-requirements"
                value={otherRequirements.join(', ')}
                onChange={(e) => setOtherRequirements(e.target.value.split(',').map(s => s.trim()))}
                placeholder="e.g., no fragrance, eco-friendly"
              />
            </div>
            <div>
              <Label htmlFor="personalized-limit">Limit</Label>
              <Input
                id="personalized-limit"
                type="number"
                value={personalizedLimit}
                onChange={(e) => setPersonalizedLimit(parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>
            <div>
              <Label htmlFor="personalized-region">Region</Label>
              <Input
                id="personalized-region"
                value={personalizedRegion}
                onChange={(e) => setPersonalizedRegion(e.target.value)}
              />
            </div>
            <Button 
              onClick={testPersonalizedRecommendations} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Test Personalized'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 font-semibold">Error:</p>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {renderResults()}
    </div>
  );
}
