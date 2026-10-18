const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY must be set in the server environment')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function runDiagnostics() {
  try {
    console.log('--- Testing Connection ---')
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1)
    
    if (testError) {
      console.error('Connection test failed:', testError)
      return
    }
    console.log('Connection test successful')

    console.log('\n--- Testing Reviews ---')
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        product:products (
          name,
          brand,
          category
        )
      `)
      .limit(5)
    
    if (reviewsError) {
      console.error('Reviews error:', reviewsError)
    } else {
      console.log('Reviews:', reviews)

      // Get unique user IDs from reviews
      const userIds = [...new Set(reviews.map(r => r.user_id))]
      
      console.log('\n--- Testing Users ---')
      const { data: users, error: usersError } = await supabase
        .rpc('get_user_profiles', { user_ids: userIds })
      
      if (usersError) {
        console.error('Users error:', usersError)
      } else {
        console.log('Users:', users)

        // Combine reviews with user data
        const reviewsWithUsers = reviews.map(review => ({
          ...review,
          user: users.find(u => u.id === review.user_id)
        }))
        console.log('\nReviews with users:', reviewsWithUsers)
      }
    }

    console.log('\n--- Testing Product Rankings ---')
    const { data: rankings, error: rankingsError } = await supabase
      .from('product_rankings')
      .select('*')
      .limit(5)
    
    if (rankingsError) {
      console.error('Rankings error:', rankingsError)
    } else {
      console.log('Rankings:', rankings)
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

runDiagnostics() 