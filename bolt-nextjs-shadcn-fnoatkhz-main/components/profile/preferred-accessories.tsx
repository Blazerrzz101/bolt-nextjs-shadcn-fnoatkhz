<<<<<<< HEAD
"use client"

import { UserProfile } from "@/types/user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/rankings/product-card"
import { usePreferredProducts } from "@/hooks/use-preferred-products"

interface PreferredAccessoriesProps {
  user: UserProfile
}

export function PreferredAccessories({ user }: PreferredAccessoriesProps) {
  const preferredProducts = usePreferredProducts(user.preferredAccessories)

  if (preferredProducts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferred Accessories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {preferredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            variant="compact"
          />
        ))}
      </CardContent>
    </Card>
  )
}
=======
import { getUserPreferences, updateUserPreferences } from '../../lib/api';

export default function PreferredAccessories({ userId }) {
  const [preferences, setPreferences] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPreferences() {
      try {
        const data = await getUserPreferences(userId);
        setPreferences(data.preferred_accessories || []);
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPreferences();
  }, [userId]);

  async function handleSave(newPreferences) {
    try {
      await updateUserPreferences(userId, { preferred_accessories: newPreferences });
      setPreferences(newPreferences);
      alert('Preferences updated!');
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Your Preferred Accessories</h2>
      <input
        type="text"
        value={preferences.join(', ')}
        onChange={(e) => setPreferences(e.target.value.split(', '))}
      />
      <button onClick={() => handleSave(preferences)}>Save</button>
    </div>
  );
}
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
