use dotenv::dotenv;
use std::env;

fn main() {
    // Load environment variables from .env file
    dotenv().ok();
    
    // Get the DATABASE_URL from environment
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:./patients.db?mode=rwc".to_string());
    
    println!("Loaded DATABASE_URL from .env: {}", database_url);
    
    // Show that environment loading works
    if database_url.contains("env_test.db") {
        println!("✅ Environment variable loading from .env file is working correctly!");
    } else {
        println!("⚠️  Using default database URL - check your .env file");
    }
}
