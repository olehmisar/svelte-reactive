<script>
  import { denominator, fraction, numerator } from "./fraction";
</script>

<button
  on:click={() => {
    $numerator++;
  }}>numerator++</button
>
<button
  on:click={() => {
    $denominator++;
  }}>denominator++</button
>
<h1>{$numerator} / {$denominator} = {$fraction}</h1>
