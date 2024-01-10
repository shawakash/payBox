use anchor_lang::prelude::*;

declare_id!("43x5Smwu9fQfdZT6QULZowtsDMzEPxXcwvGqtqRrRP7P");

#[program]
pub mod indexer {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
