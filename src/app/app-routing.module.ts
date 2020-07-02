import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkerTestComponent } from './worker-test/worker-test.component';

const routes: Routes = [
  { path: 'worker', component: WorkerTestComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
