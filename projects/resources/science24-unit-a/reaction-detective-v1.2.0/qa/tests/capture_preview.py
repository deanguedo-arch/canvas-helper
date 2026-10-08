#!/usr/bin/env python3
"""Capture actual runtime, not a generated concept image."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright
from responsive_test import ANSWERS
R=Path(__file__).resolve().parents[2]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1648,'height':1050});page.set_content((R/'PLAY.html').read_text(),wait_until='load')
 page.locator('[data-action=start]').click();page.locator('[data-action=practice]').click()
 for i,(_,conclusion,reaction,response,pair,text) in enumerate(ANSWERS[:2]):
  page.locator('#prediction').select_option('insufficient')
  for e in pair:page.locator(f'[data-action=reveal][data-id={e}]').click()
  for e in pair:page.locator('#select-'+e).check()
  page.locator('#conclusion-'+conclusion).check()
  if reaction:page.locator('#reaction').select_option(reaction)
  if response:page.locator('#response').select_option(response)
  page.locator('#explanation').fill(text)
  if i==0:
   page.locator('[data-action=submit]').click()
   for check in page.locator('[data-rubric]').all():check.check()
   page.locator('[data-action=advance]').click()
 page.locator('#case-heading').focus();page.evaluate('window.scrollTo(0,0)')
 page.screenshot(path=str(R/'qa/screenshots/20_actual_game_desktop.png'),full_page=True)
 page.set_viewport_size({'width':390,'height':844});page.evaluate('window.scrollTo(0,0)')
 page.screenshot(path=str(R/'qa/screenshots/21_actual_game_mobile.png'),full_page=True)
 b.close()
