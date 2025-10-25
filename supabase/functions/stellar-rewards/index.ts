import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as StellarSdk from "https://esm.sh/@stellar/stellar-sdk@14.3.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wallet, amount, score, totalQuestions } = await req.json();

    console.log('Processing reward request:', { wallet, amount, score, totalQuestions });

    // Get the secret key from environment
    const secretKey = Deno.env.get('STELLAR_SECRET_KEY');
    
    if (!secretKey) {
      throw new Error('STELLAR_SECRET_KEY not configured');
    }

    // Initialize Stellar server (testnet)
    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    console.log('Source account:', sourcePublicKey);

    // Load the source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);

    // Build the transaction
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "100000",
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: wallet,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        })
      )
      .addMemo(StellarSdk.Memo.text(`Quiz Score: ${score}/${totalQuestions}`))
      .setTimeout(180)
      .build();

    // Sign the transaction
    transaction.sign(sourceKeypair);

    // Submit the transaction
    const result = await server.submitTransaction(transaction);

    console.log('Transaction successful:', result.hash);

    // If score >= 70%, issue NFT badge
    let nftResult = null;
    if ((score / totalQuestions) >= 0.7) {
      console.log('Issuing NFT certificate...');
      
      try {
        // Create NFT asset
        const nftAssetCode = `QUIZ${Date.now().toString().slice(-6)}`;
        const nftAsset = new StellarSdk.Asset(nftAssetCode, sourcePublicKey);

        // Build NFT issuance transaction
        const nftAccount = await server.loadAccount(sourcePublicKey);
        const nftTransaction = new StellarSdk.TransactionBuilder(nftAccount, {
          fee: "100000",
          networkPassphrase: StellarSdk.Networks.TESTNET,
        })
          .addOperation(
            StellarSdk.Operation.changeTrust({
              asset: nftAsset,
              source: wallet,
            })
          )
          .addOperation(
            StellarSdk.Operation.payment({
              destination: wallet,
              asset: nftAsset,
              amount: "1",
            })
          )
          .addMemo(StellarSdk.Memo.text(`Achievement: ${score}/${totalQuestions} correct`))
          .setTimeout(180)
          .build();

        nftTransaction.sign(sourceKeypair);
        nftResult = await server.submitTransaction(nftTransaction);
        
        console.log('NFT issued:', nftResult.hash);
      } catch (nftError) {
        console.error('NFT issuance failed (non-critical):', nftError);
        // Don't fail the whole request if NFT fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        transactionHash: result.hash,
        amount,
        nftIssued: !!nftResult,
        nftHash: nftResult?.hash,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error processing reward:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
