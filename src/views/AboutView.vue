<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<style>
.about {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.about h1 {
  color: #333;
  font-size: 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about {
    padding: 16px;
  }
  
  .about h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .about {
    padding: 12px;
  }
  
  .about h1 {
    font-size: 1.3rem;
  }
}
</style>
