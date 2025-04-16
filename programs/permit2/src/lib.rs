use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("YourProgramIDHere");

#[program]
pub mod permit2 {
    use super::*;

    pub fn permit_transfer(
        ctx: Context<PermitTransfer>,
        permit: Permit,
        signature: [u8; 64],
    ) -> Result<()> {
        let signer_pubkey = permit.owner;

        let data = permit.try_to_vec()?;
        let hash = anchor_lang::solana_program::keccak::hash(&data);

        anchor_lang::solana_program::program::invoke(
            &anchor_lang::solana_program::ed25519_program::new_ed25519_instruction(
                &signature,
                &signer_pubkey.to_bytes(),
                &hash.0,
            ),
            &[],
        )?;

        require!(
            Clock::get()?.unix_timestamp <= permit.deadline,
            PermitError::Expired
        );

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.source.to_account_info(),
                to: ctx.accounts.destination.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );

        token::transfer(cpi_ctx, permit.amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct PermitTransfer<'info> {
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    /// CHECK: Checked via signature
    pub owner: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Permit {
    pub owner: Pubkey,
    pub spender: Pubkey,
    pub token_account: Pubkey,
    pub destination_account: Pubkey,
    pub amount: u64,
    pub nonce: u64,
    pub deadline: i64,
}

#[error_code]
pub enum PermitError {
    #[msg("Permit has expired.")]
    Expired,
}